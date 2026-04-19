import { access, constants, mkdir, readFile, writeFile } from 'node:fs/promises';
import type { CurrentSettings } from '../Utility/types/Settings.js';
import { NULL_UUID } from '../store/constants/core.js';
import { app as electron } from 'electron';
import { join } from 'node:path';
import { json } from 'typia';

/** Engine responsible for managing persisted application settings. */
export class SettingsEngine {
    /** Instance of the SettingsEngine singleton. */
    static #instance: SettingsEngine | undefined = void 0;
    /** Path to the directory where the settings file is stored and other data can be stored. */
    public appDataPath: string;
    /** Current settings for the application. These are stored on non-volatile memory. Loaded at startup. */
    public currentSettings: CurrentSettings;
    /** Indicates whether the settings are currently being loaded. */
    public isLoading: Promise<void>;
    /** Name of the settings file to ensure consistency across the settings engine. */
    #settingsFileName: string;

    // #region Initialization

    /** Initializes the properties and state of the SettingsEngine. */
    private constructor() {
        // Initialize the current settings with default values. These will be overwritten once the actual settings are loaded.
        this.currentSettings = {
            'activityList': [],
            'checkInLogFolderPath': void 0,
            'clientId': NULL_UUID,
            'memberFolderPath': void 0,
            'tenantId': 'common',
            'version': 1
        };

        // Set the setting file name to ensure consistency across the class and avoid magic strings.
        this.#settingsFileName = 'settings.json';

        // Determine the path to the application data directory, using ProgramData on Windows and the appropriate app data path on other platforms.
        this.appDataPath = join(process.env['ProgramData'] ?? electron.getPath('appData'), electron.getName());

        // Start the load process for the current settings immediately upon instantiation.
        this.isLoading = this.#loadSettings();
    }

    /**
     * Retrieves the singleton instance of the SettingsEngine.
     * If the instance does not exist, it creates a new one.
     * @returns The singleton instance of the SettingsEngine.
     */
    public static getInstance(): SettingsEngine {
        // Check if the singleton instance already exists. If not, create it.
        if (SettingsEngine.#instance === void 0) { SettingsEngine.#instance = new SettingsEngine(); }

        // Return the singleton instance of the SettingsEngine.
        return SettingsEngine.#instance;
    }

    /**
     * Resets the singleton instance of this class.
     * This is useful for testing purposes or if you need to reinitialize the settings during runtime.
     * @deprecated This method is intended for testing and should not be used in production code.
     */
    public static clearInstance(): void { SettingsEngine.#instance = void 0; }

    // #endregion Initialization

    /** Loads settings from disk when present and leaves defaults in place when the file is absent or invalid. */
    async #loadSettings(): Promise<void> {
        // Create the folder if it doesn't exist
        try {
            // Check if the folder is available to the app.
            await access(this.appDataPath, constants.F_OK);
        } catch (_error) {
            // Create the folder structure if it doesn't exist.
            await mkdir(this.appDataPath, { 'recursive': true });
        }

        // Attempt to load the settings from disk, and if it fails, create a new settings file with the defaults.
        try {
            // Check if access to the settings is present before attempting to read it
            await access(join(this.appDataPath, this.#settingsFileName), constants.F_OK);

            /** Raw text data straight from the settings file to be validated (untrusted). */
            const rawSettingsContent = await readFile(join(this.appDataPath, this.#settingsFileName), 'utf8');

            // Validate the settings file's contents and parse it into the currentSettings property if valid.
            this.currentSettings = json.assertParse<CurrentSettings>(rawSettingsContent);
        } catch (_error) {
            // Write the default settings to disk if the file doesn't exist or is invalid
            await writeFile(join(this.appDataPath, this.#settingsFileName), json.stringify(this.currentSettings), 'utf8');
        }
    }

    /** Saves the current settings to ProgramData as a JSON document. */
    async saveSettings(): Promise<void> {
        // Create the folder if it doesn't exist to ensure valid write path
        await mkdir(this.appDataPath, { 'recursive': true });

        /** Serialized JSON representation of the current settings. */
        const serializedSettings = json.stringify(this.currentSettings);

        // Write the settings to disk, overwriting any existing settings file.
        await writeFile(join(this.appDataPath, this.#settingsFileName), serializedSettings, 'utf8');
    }
}
