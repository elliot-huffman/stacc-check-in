import { StorageEngine } from './Storage.js';

/** Engine responsible for managing access control operations, the main business logic for the app. */
export class AccessControlEngine {
    /** Instance of the AccessControlEngine singleton. */
    static #instance: AccessControlEngine | undefined = void 0;
    /** Instance of the StorageEngine used by the AccessControlEngine. */
    #storageEngine: StorageEngine;

    // #region Initialization

    /**
     * Initializes the properties and state of the StorageEngine.
     * @param storageEngine Instance of the StorageEngine to use for the AccessControlEngine's operations, required for dependency injection.
     */
    private constructor(storageEngine: StorageEngine) {
        // #region Input Validation
        if (!(storageEngine instanceof StorageEngine)) { throw new TypeError('The provided storage engine is not an instance of the StorageEngine class!', { 'cause': 'Input validation!' }); }
        // #endregion Input Validation

        // Store a copy of the storage engine for later use
        this.#storageEngine = storageEngine;
    }

    /**
     * Initializes the singleton instance if not already and then returns the instance.
     * @returns Instance of the singleton class.
     */
    public static async getInstance(): Promise<AccessControlEngine> {
        /** Check if the singleton instance is initialized, and initialize it if it isn't. */
        if (typeof this.#instance === 'undefined') {
            /** Instance of the StorageEngine used by the AccessControlEngine. */
            const storageEngine = await StorageEngine.getInstance();

            // Finish loading the access control engine's properties and state after the storage engine is loaded, as it is a dependency for the access control engine.
            this.#instance = new AccessControlEngine(storageEngine);
        }

        // If the instance is already initialized, return it to the caller.
        return this.#instance;
    }

    /**
     * Resets the singleton instance to an uninitialized state.
     * @deprecated This is used for testing purposes to ensure that each test can start with a clean slate.
     */
    public static clearInstance(): void { this.#instance = void 0; }

    // #endregion Initialization
}
