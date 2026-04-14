import type { AccessTokenV1Claims, AccessTokenV2Claims, AuthorizationData, JwksKeySet, OpenIdConfiguration } from '../Utility/types/Authentication.js';
import { assertGuard, assertGuardEquals, is, tags } from 'typia';
import { decode, verify } from 'jws';
import { InteractiveBrowserCredential } from '@azure/identity';
import { NULL_UUID } from '../store/constants/core.js';
import { SettingsEngine } from './Settings.js';

/** Engine responsible for managing and validating authentication with Entra ID. */
export class AuthenticationEngine {
    /** Instance of the AuthenticationEngine singleton. */
    public static instance: AuthenticationEngine | undefined = void 0;
    /** Configured authentication credential that logs into Entra ID and can be used to retrieve access tokens. */
    public entra: InteractiveBrowserCredential;
    /** Instance of the settings engine to use for authentication configuration. */
    #settingsEngine: SettingsEngine;

    /**
     * Initializes the properties and state of the AuthenticationEngine.
     * @param settingsEngine Instance of the settings engine that has had its loading flag awaited.
     */
    private constructor(settingsEngine: SettingsEngine) {
        // Store a copy of the settings engine for later use
        this.#settingsEngine = settingsEngine;

        // Configure the initial auth credential
        this.entra = new InteractiveBrowserCredential({
            'clientId': this.#settingsEngine.currentSettings.clientId,
            'tenantId': this.#settingsEngine.currentSettings.tenantId
        });
    }

    /**
     * Retrieves the singleton instance of the AuthenticationEngine.
     * If the instance does not exist, it creates a new one.
     * @returns The singleton instance of the AuthenticationEngine.
     */
    public static async getInstance(): Promise<AuthenticationEngine> {
        // Check if the singleton instance already exists. If not, create it.
        if (AuthenticationEngine.instance === void 0) {
            /** Point in time capture of the system's global metadata store's current state. */
            const settingsEngine = SettingsEngine.getInstance();

            // Wait for initialization to finish before using the settings engine to ensure the correct settings are loaded in memory
            await settingsEngine.isLoading;

            // Instantiate the class instance
            AuthenticationEngine.instance = new AuthenticationEngine(settingsEngine);
        }

        // Return the singleton instance of the AuthenticationEngine.
        return AuthenticationEngine.instance;
    }

    /**
     * Checks the access token's claims and cryptographic validity to determine if it is a valid Entra ID access token for this application.
     *
     * Client ID defaults to the client ID specified in the settings engine's current settings if not provided.
     * If the client ID is provided as a parameter, the value stored in the settings engine will be ignored.
     *
     * Validation mode defaults to multi-tenant mode.
     * If a tenant ID is provided, the token will only be considered valid if it is issued for that tenant.
     * If a tenant ID is not provided, any tenant will be allowed and the tenant from the access token will be used during validation.
     * @param accessToken String to be checked if it is a valid Entra ID access token.
     * @param tenantId Tenant ID to validate to. If not provided, any tenant is allowed and the tenant from the access token will be used during validation.
     * @param clientId Client ID override, if not provided, uses the client ID from the settings engine's current settings.
     * @returns Flag indicating whether the access token is valid.
     */
    public async confirmAccessToken(accessToken: string, tenantId?: string & tags.Format<'uuid'>, clientId?: string & tags.Format<'uuid'>): Promise<boolean> {
        // #region Input Validation
        assertGuardEquals(accessToken);

        assertGuardEquals(clientId);

        assertGuardEquals(tenantId);

        /** Parsed components of the access token used for validation. */
        const tokenComponents = decode(accessToken);

        // If the token is not in the correct format, it is not valid
        if (tokenComponents === null) { return false; }

        // If the token header doesn't contain a key ID, it is not valid as we cannot determine which signing key to use to validate the signature
        if (!tokenComponents.header.kid) { return false; }

        // If the required claims are not present in the token, it is not valid
        if (!is<AccessTokenV1Claims | AccessTokenV2Claims>(tokenComponents.payload)) { return false; }
        // #endregion Input Validation

        // #region Initialization

        /** Client ID of the app to be used during validation. */
        const computedClientId = clientId ?? this.#settingsEngine.currentSettings.clientId;

        // #endregion Initialization

        // #region Cryptographic Validation

        /** This is the tenant ID as provided by the access token's 'iss' claim. */
        const tokenTenantId = this.#findTenantIdFromIssuer(tokenComponents.payload.iss);

        // If no tenant could be extracted, it is not a valid MSFT token
        if (!tokenTenantId) { return false; }

        /**
         * OpenID configuration for the tenant ID specified in the access token.
         * If a tenant ID is provided to in the function parameters, uses that one instead and ignores the token's tenant ID.
         * This value can be trusted as it is from Microsoft.
         */
        const openIdConfig = await this.#getTenantConfig(tenantId ?? tokenTenantId, tokenComponents.payload.ver === '2.0' ? '2.0' : '1.0');

        // If the OpenID configuration cannot be retrieved for the tenant specified in the token, it is not valid as we cannot validate the issuer or retrieve signing keys to validate the signature
        if (!openIdConfig) { return false; }

        // If the Microsoft provided issuer doesn't match the token provided issuer, the token is not valid
        if (tokenComponents.payload.iss !== openIdConfig.issuer) { return false; }

        /** Signing keys that MSFT has specified are valid for access tokens issued to this tenant's app. */
        const signingKeyList = await this.#getTenantSigningKeys(openIdConfig, computedClientId);

        /** Key ID that matches the token header's key ID. Undefined if no matching key is found. */
        const selectedKey = signingKeyList.keys.find((publicKey) => publicKey.kid === tokenComponents.header.kid);

        // If no key can be found that matches the key ID in the token header, the token is not valid as we cannot verify the signature without the correct key
        if (!selectedKey) { return false; }

        /** PEM-encoded certificate for the selected key which will be used to verify the token's signature. */
        const pemEncodedCertificate = `-----BEGIN CERTIFICATE-----\n${ selectedKey.x5c[0] }\n-----END CERTIFICATE-----`;

        // If the signature doesn't cryptographically verify, then it is not a Microsoft signed access token
        if (!verify(accessToken, 'RS256', pemEncodedCertificate)) { return false; }

        // #endregion Cryptographic Validation

        // #region Claims Validation

        /** Current date and time for validating token claims. */
        const now = new Date();

        /** Timestamp indicating that times after this are valid. */
        const notBefore = new Date(tokenComponents.payload.nbf * 1000);

        /** Timestamp indicating that times before this are valid. */
        const expiresAt = new Date(tokenComponents.payload.exp * 1000);

        // If the current time is before the notBefore claim, the token is not valid yet and therefore not valid
        if (now < notBefore) { return false; }

        // If the current time is after the expiresAt claim, the token is no longer valid
        if (now > expiresAt) { return false; }

        // If the client ID from the token's audience claim doesn't match the client ID configured for validation, then the token is not valid for this app
        if (computedClientId !== tokenComponents.payload.aud) { return false; }

        // If a tenant ID was provided for validation and the tenant ID from the token doesn't match, then the token is not valid for the expected tenant
        if (tenantId && tokenTenantId !== tenantId) { return false; }

        // #endregion Claims Validation

        // If all checks pass, return true
        return true;
    }

    /**
     * Extracts and processes the authorization data from the provided access token.
     * @param accessToken Access token to extract the claims from.
     * @returns Processed authorization data for easy consumption within the app.
     */
    public getAccessTokenAuthzData(accessToken: string): AuthorizationData {
        // #region Input Validation
        assertGuardEquals(accessToken);
        // #endregion Input Validation

        /** Current state of the AuthZ data that has been extracted from the access token. */
        const authzData: AuthorizationData = {
            'entraRoleList': [],
            'objectId': null,
            'permissionList': [],
            'subjectId': '',
            'tenantId': NULL_UUID
        };

        /** Raw claims from the access token to be processed and extracted. */
        const tokenClaims = decode(accessToken);

        // Ensure that the token is in the correct format before continuing
        if (tokenClaims === null) { throw new TypeError('The provided access token is not a valid JWT!', { 'cause': 'Input validation!' }); }

        // Ensure that the token contains the expected claims before continuing, as the rest of the function relies on those claims being present and in the correct format
        if (!is<AccessTokenV1Claims | AccessTokenV2Claims>(tokenClaims.payload)) { throw new TypeError('The provided access token does not contain the expected claims!', { 'cause': 'Input validation!' }); }

        /** Extracted tenant ID from the issuer claim in the access token. */
        const tenantId = this.#findTenantIdFromIssuer(tokenClaims.payload.iss);

        // If the tenant ID cannot be extracted from the token configured issuer, throw an error as it is not valid
        if (!tenantId) { throw new TypeError('The provided access token does not contain a valid tenant ID in the issuer claim!', { 'cause': 'Input validation!' }); }

        // Populate the list of Microsoft Entra roles assigned to the authenticated principal if the 'wids' claim is present
        if (tokenClaims.payload.wids) { authzData.entraRoleList = tokenClaims.payload.wids; }

        // Populate the Object ID of the authenticated principal if the claim is present in the token
        if (tokenClaims.payload.oid) { authzData.objectId = tokenClaims.payload.oid; }

        // If application permissions are present, process them
        if (tokenClaims.payload.roles) {
            // Iterate through each provided Application permission assigned to the authenticated principal
            for (const permission of tokenClaims.payload.roles) {
                // Add the current permission to the list of permissions in the authz data if it is not already present
                if (!authzData.permissionList.includes(permission)) { authzData.permissionList.push(permission); }
            }
        }

        // If delegated permissions are present, process them
        if (tokenClaims.payload.scp) {
            // Iterate through each provided Delegated permission assigned to the authenticated principal
            for (const permission of tokenClaims.payload.scp.split(' ')) {
                // Add the current permission to the list of permissions in the authz data if it is not already present
                if (!authzData.permissionList.includes(permission)) { authzData.permissionList.push(permission); }
            }
        }

        // Populate the subject ID of the authenticated principal
        authzData.subjectId = tokenClaims.payload.sub;

        // Populate the tenant ID that the authenticated principal authenticated to
        authzData.tenantId = tenantId;

        // Return the extracted and computed data to the caller
        return authzData;
    }

    /**
     * Looks up the Microsoft Entra tenant ID for a given domain.
     * @param domain Domain used in resolving the tenant ID.
     * @returns GUID of the tenant, if no tenant found, undefined.
     */
    public static async findTenantId(domain: string & tags.Format<'hostname'>): Promise<string & tags.Format<'uuid'> | undefined> {
        // #region Input Validation
        assertGuardEquals(domain);
        // #endregion Input Validation

        /** Information about the OpenID configuration for the specified domain. Used to extract the tenant ID. */
        const rawConfigResponse = await fetch(`https://login.microsoftonline.com/${ domain }/v2.0/.well-known/openid-configuration`);

        // Only extract the tenant ID if the domain could be resolved
        if (rawConfigResponse.status === 200) {
            /** JSON parsed response containing the OpenID configuration for the specified domain. */
            const parsedResponse = await rawConfigResponse.json() as OpenIdConfiguration;

            // Check if the structure is actually an OpenID configuration before trusting the contents
            if (is(parsedResponse)) {
                /** Parsed URL of the issuer from the OpenID configuration. */
                const parsedIssuer = new URL(parsedResponse.issuer);

                // Return the tenant ID to the caller after extraction
                return parsedIssuer.pathname.split('/')[1] as string & tags.Format<'uuid'>;
            }
        }

        // Return undefined if the domain can't be resolved
        return void 0;
    }

    /*
     * Helper Functions
     */
    // #region Helper Functions

    /**
     * Extracts the tenant ID from the issuer URL.
     * Supports untrusted issuer strings as long as they are in the correct format, but will return undefined for any issuer that is not a valid URL or does not have a valid tenant ID in the expected segment of the path.
     * @param issuer Issuer URL from which to extract the tenant ID.
     * @returns Tenant ID if available and valid, otherwise undefined.
     */
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    #findTenantIdFromIssuer(issuer: string): string & tags.Format<'uuid'> | undefined {
        // #region Input Validation
        assertGuardEquals(issuer);
        // #endregion Input Validation

        // If the token configured issuer is not a valid URL, return undefined as it is not valid
        if (!URL.canParse(issuer)) { return void 0; }

        /** Issuer broken down into components so that regex is not needed when operating on the values within. */
        const parsedIssuerUrl = new URL(issuer);

        /** Extracted tenant ID from the token configured issuer URL. */
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        const tenantId = parsedIssuerUrl.pathname.split('/')[1];

        // If the tenant ID extracted from the token configured issuer is not a valid UUID, return undefined as it is not valid
        if (!is<string & tags.Format<'uuid'>>(tenantId)) { return void 0; }

        // Return the tenant ID
        return tenantId;
    }

    /**
     * Retrieves the OpenID configuration for a specified tenant and version.
     * @param tenantIdentifier Tenant ID or domain for which to retrieve the OpenID configuration.
     * @param version Schema version of the OpenID configuration to retrieve ('1.0' or '2.0').
     * @returns OpenID configuration if available, otherwise undefined.
     */
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    async #getTenantConfig(tenantIdentifier: string & tags.Format<'uuid'> | string & tags.Format<'hostname'>, version: '1.0' | '2.0'): Promise<OpenIdConfiguration | undefined> {
        // #region Input Validation
        assertGuardEquals(tenantIdentifier);

        assertGuardEquals(version);
        // #endregion Input Validation

        /** Raw OpenID configuration response for the specified tenant and version. */
        const rawConfigResponse = await fetch(`https://login.microsoftonline.com/${ tenantIdentifier }/${ version === '2.0' ? 'v2.0/' : '' }.well-known/openid-configuration`);

        // If the config is not available, return undefined as it is an invalid tenant
        if (rawConfigResponse.status !== 200) { return void 0; }

        /** Parsed OpenID configuration for the specified tenant and version. */
        const parsedOpenIdConfig = await rawConfigResponse.json() as OpenIdConfiguration;

        // Ensure that the parsed config is in the correct format before trusting its contents
        if (!is(parsedOpenIdConfig)) { return void 0; }

        // Return the parsed OpenID configuration for the specified tenant and version
        return parsedOpenIdConfig;
    }

    /**
     * Retrieves the signing keys for a specified tenant and OpenID configuration.
     * @param openIdConfig OpenID configuration for the specified tenant.
     * @param clientId Client ID for which to retrieve the specific/custom signing keys for.
     * @returns Signing keys for the specified tenant and OpenID configuration if available, otherwise no signing keys will be returned.
     */
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    async #getTenantSigningKeys(openIdConfig: OpenIdConfiguration, clientId: string & tags.Format<'uuid'>): Promise<JwksKeySet> {
        // #region Input Validation
        assertGuard(openIdConfig);

        assertGuardEquals(clientId);
        // #endregion Input Validation

        /** Parsed URL for the keyset request. */
        const keyRequestUrl = new URL(openIdConfig.jwks_uri);

        // Update the AppID query parameter so that the keyset specific to the app is used for signature validation
        keyRequestUrl.searchParams.set('appid', clientId);

        /** Raw response for the keyset request. */
        const keysetResponse = await fetch(keyRequestUrl);

        if (keysetResponse.status !== 200) { return { 'keys': [] }; }

        /** Keyset from Microsoft for the specified tenant and app used to sign all the access tokens. */
        const parsedKeyset = await keysetResponse.json() as JwksKeySet;

        // Ensure that the minimum set of properties are present on the keyset response before trusting its contents and using it for token validation.
        if (!is(parsedKeyset)) { return { 'keys': [] }; }

        // Iterate through each key and add the issuer if not present
        for (const signingKey of parsedKeyset.keys) {
            // Check if the issuer is not present on the signing key and add it if not present
            if (!('issuer' in signingKey)) { signingKey.issuer = openIdConfig.issuer; }
        }

        // Return the parsed keyset to the caller
        return parsedKeyset;
    }

    // #endregion Helper Functions
}
