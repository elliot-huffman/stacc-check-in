import { assertGuardEquals, equals, type tags } from 'typia';

/** Provide deep linking support to the application. */
export class DeepLinkEngine {
    /** Global instance of the class to ensure that only one is ever used (singleton). */
    private static instance: DeepLinkEngine | undefined = void 0;

    /** Creates a new instance of DeepLinkEngine when called. */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }

    /**
     * Initializes the singleton instance if not already and then returns the instance.
     * @returns Instance of the singleton class.
     */
    public static getInstance(): DeepLinkEngine {
        /** Check if the singleton instance is initialized, and initialize it if it isn't. */
        if (typeof this.instance === 'undefined') { this.instance = new DeepLinkEngine(); }

        // If the instance is already initialized, return it to the caller.
        return this.instance;
    }

    /**
     * Resets the singleton instance to an uninitialized state.
     * @deprecated This is used for testing purposes to ensure that each test can start with a clean slate.
     */
    public static clearInstance(): void { this.instance = void 0; }

    /**
     * Validates and then executes the provided deep link.
     * Invalid links are ignored.
     * @param deepLink Link provided by the OS when the app is opened via a deep link. The link is expected to be in the shape of a URI, e.g. check-in://command?param1=value1&param2=value2.
     */
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    deepLinkHandler(deepLink: string): void {
        // #region Input Validation
        assertGuardEquals(deepLink);
        // #endregion Input Validation

        // Only operate on the provided link if it is in the shape of a URI
        if (equals<string & tags.Format<'uri'>>(deepLink)) {
            /** Parse the deep link into a URL object for easier manipulation so no regex is needed. */
            const parsedLink = new URL(deepLink);

            // Handle each command provided by the deep link. The command is the host, e.g. check-in://command, where command is the host.
            switch (parsedLink.host) {
                // Catch all
                default:
                    // Do nothing for now
                    break;
            }
        }
    }
}
