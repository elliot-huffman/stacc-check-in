import type { AuthorizationData } from '../Utility/types/Authentication.js';
import { InteractiveBrowserCredential } from '@azure/identity';
import { NULL_UUID } from '../store/constants/core.js';
import { SettingsEngine } from './Settings.js';
import { assertGuardEquals } from 'typia';
import { decode } from 'jws';

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
     * @param accessToken String to be checked if it is a valid Entra ID access token.
     * @param clientId Client ID override, if not provided, uses the client ID from the settings engine's current settings.
     * @param tenantId Tenant ID override, if not provided, uses the tenant ID from the settings engine's current settings.
     * @returns Flag indicating whether the access token is valid.
     */
    async compareAccessToken(accessToken: string, clientId?: string, tenantId?: string): Promise<boolean> {
        // #region Input Validation
        assertGuardEquals(accessToken);

        assertGuardEquals(clientId);

        assertGuardEquals(tenantId);
        // #endregion Input Validation

        // Check cryptographic validity

        // Check claims

        // If all checks fail, return false
        return false;
    }

    exportAccessTokenAuthzData(accessToken: string): AuthorizationData {
        // #region Input Validation
        assertGuardEquals(accessToken);
        // #endregion Input Validation

        /** Current state of the AuthZ data that has been extracted from the access token. */
        const authzData: AuthorizationData = {
            'objectId': NULL_UUID,
            'permissionList': [],
            'tenantId': NULL_UUID
        };

        /** Raw claims from the access token to be processed and extracted. */
        const tokenClaims = decode(accessToken);

        // Ensure that the token is in the correct format before continuing
        if (tokenClaims === null) { throw new TypeError('The provided access token is not a valid JWT!', { 'cause': 'Input validation!' }); }

        // Return the extracted and computed data to the caller
        return authzData;
    }
}
