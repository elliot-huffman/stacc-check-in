import { SettingsEngine } from './Settings.js';

/** Engine responsible for managing persistent storage operations. */
export class StorageEngine {
    /** Instance of the StorageEngine singleton. */
    static #instance: StorageEngine | undefined = void 0;
    /** Instance of the settings engine to use for configuring the storage engine. */
    #settingsEngine: SettingsEngine;

    // #region Initialization

    /** Initializes the properties and state of the StorageEngine. */
    private constructor() {
        // Store a copy of the settings engine for later use
        this.#settingsEngine = SettingsEngine.getInstance();
    }

    /**
     * Initializes the singleton instance if not already and then returns the instance.
     * @returns Instance of the singleton class.
     */
    public static async getInstance(): Promise<StorageEngine> {
        /** Check if the singleton instance is initialized, and initialize it if it isn't. */
        if (typeof this.#instance === 'undefined') {
            /** Point in time capture of the system's global metadata store's current state. */
            const settingsEngine = SettingsEngine.getInstance();

            // Wait for initialization to finish before using the settings engine to ensure the correct settings are loaded in memory
            await settingsEngine.isLoading;

            // Finish loading the storage engine's properties and state after the settings engine is loaded, as it is a dependency for the storage engine.
            this.#instance = new StorageEngine();
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
