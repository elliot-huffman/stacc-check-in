import { assertGuardEquals, type tags } from 'typia';
import { AuthenticationEngine } from './Authentication.js';

/** Client that makes various REST API calls and provides authenticated/configured SDKs. */
export class RestClientEngine {
    /** Global instance of the class to ensure that only one is ever used (singleton). */
    static #instance: RestClientEngine | undefined = void 0;
    /** Instance of the AuthenticationEngine class used for retrieving access tokens to authenticate REST API calls with Entra ID. */
    #authEngine: AuthenticationEngine;

    // #region Initialization

    /**
     * Creates a new instance of RestClientEngine when called.
     * @param authenticationEngine Instance of the AuthenticationEngine class to use for retrieving access tokens to authenticate REST API calls with Entra ID.
     */
    private constructor(authenticationEngine: AuthenticationEngine) { this.#authEngine = authenticationEngine; }

    /**
     * Initializes the singleton instance if not already and then returns the instance.
     * @returns Instance of the singleton class.
     */
    public static async getInstance(): Promise<RestClientEngine> {
        // Check if the singleton instance already exists. If not, create it.
        if (RestClientEngine.#instance === void 0) {
            /** Initialize the AuthenticationEngine instance. */
            const authEngine = await AuthenticationEngine.getInstance();

            // Instantiate the class instance
            RestClientEngine.#instance = new RestClientEngine(authEngine);
        }

        // Return the singleton instance of the RestClientEngine.
        return RestClientEngine.#instance;
    }

    /**
     * Resets the singleton instance to an uninitialized state.
     * @deprecated This is used for testing purposes to ensure that each test can start with a clean slate.
     */
    public static clearInstance(): void { this.#instance = void 0; }

    // #endregion Initialization

    /**
     * Retrieves the profile picture of the currently authenticated user.
     * @param userId Object ID of the user to retrieve the profile picture for. If not provided, the profile picture of the currently authenticated user will be retrieved.
     * @returns A base64-encoded string representing the user's profile picture, or undefined if not available.
     */
    public async getProfilePicture(userId?: string & tags.Format<'uuid'>): Promise<string | undefined> {
        // #region Input validation
        assertGuardEquals(userId);
        // #endregion Input validation

        /** Access token used to retrieve the profile picture of the currently authenticated user. */
        const accessToken = await this.#authEngine.entra.getToken('.default');

        /** Graph API endpoint path to retrieve the user's profile picture. */
        const userPath = userId ? `users/${ userId }` : 'me';

        // Gracefully attempt to retrieve the profile picture from the currently authenticated principal.
        try {
            /** Raw picture provided from the Graph API in PNG format. */
            const rawPicture = await fetch(`https://graph.microsoft.com/v1.0/${ userPath }/photo/$value`, {
                'headers': { 'Authorization': `Bearer ${ accessToken.token }` }
            });

            // Ensure that the image downloaded successfully
            if (rawPicture.status !== 200) { return void 0; }

            /** Fetch compatible array buffer from the raw picture. */
            const convertedArrayBuffer = await rawPicture.arrayBuffer();

            /** Node.js compatible buffer from the array buffer to be converted to base64. */
            const nodeBuffer = Buffer.from(convertedArrayBuffer);

            /** Defer the type of image to what the Graph API provides, falling back to PNG if not specified. */
            const imageType = rawPicture.headers.get('Content-Type') ?? 'image/png';

            return `data:${ imageType };base64,${ nodeBuffer.toString('base64') }`;
        } catch (error) {
            // Ignore and don't provide a picture
        }

        // Return nothing if an image could not be retrieved for any reason, including if the user doesn't have a profile picture
        return void 0;
    }
}
