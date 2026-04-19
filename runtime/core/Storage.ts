import type { CheckInOut, Member } from '../Utility/types/AccessControl.js';
import { assertGuardEquals, json } from 'typia';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { SettingsEngine } from './Settings.js';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

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

    /**
     * Creates a check-in audit log entry for a member.
     * @param memberId Unique identifier of the member being checked in.
     * @param activity List of activities the member is checking in for.
     * @param initiatingActor Unique identifier of the principal that initiated the check-in.
     * @returns Unique identifier of the created audit log entry.
     */
    public async checkIn(memberId: CheckInOut['memberId'], activity: string[], initiatingActor: CheckInOut['initiatingActor']): Promise<CheckInOut['id']> {
        // #region Input Validation
        assertGuardEquals(memberId);

        assertGuardEquals(activity);

        assertGuardEquals(initiatingActor);
        // #endregion Input Validation

        /** Captures the check-in audit log entry with a guaranteed unique identifier for persistent storage. */
        const storedCheckInLog: CheckInOut = {
            activity,
            'id': randomUUID(),
            initiatingActor,
            memberId,
            'timestamp': new Date().toISOString(),
            'type': 'check-in'
        };

        /** Path to the check-in log folder in persistent storage. */
        const checkInOutLogFolderPath = this.#calculateFolderPath('checkInOutLog');

        /** Path to the check-in log JSON file in persistent storage. */
        const checkInLogPath = join(checkInOutLogFolderPath, `${ storedCheckInLog.id }.json`);

        // Create the log folder if it doesn't exist so the check-in record has a valid destination.
        await mkdir(checkInOutLogFolderPath, { 'recursive': true });

        // Write the check-in log to disk.
        await writeFile(checkInLogPath, json.stringify(storedCheckInLog));

        // Return the created audit log identifier to the caller.
        return storedCheckInLog.id;
    }

    /**
     * Creates a check-out audit log entry for a member.
     * @param memberId Unique identifier of the member being checked out.
     * @param initiatingActor Unique identifier of the principal that initiated the check-out.
     * @returns Unique identifier of the created audit log entry.
     */
    public async checkOut(memberId: CheckInOut['memberId'], initiatingActor: CheckInOut['initiatingActor']): Promise<CheckInOut['id']> {
        // #region Input Validation
        assertGuardEquals(memberId);

        assertGuardEquals(initiatingActor);
        // #endregion Input Validation

        /** Captures the check-out audit log entry with a guaranteed unique identifier for persistent storage. */
        const storedCheckOutLog: CheckInOut = {
            'id': randomUUID(),
            initiatingActor,
            memberId,
            'timestamp': new Date().toISOString(),
            'type': 'check-out'
        };

        /** Path to the check-out log folder in persistent storage. */
        const checkInOutLogFolderPath = this.#calculateFolderPath('checkInOutLog');

        /** Path to the check-out log JSON file in persistent storage. */
        const checkOutLogPath = join(checkInOutLogFolderPath, `${ storedCheckOutLog.id }.json`);

        // Create the log folder if it doesn't exist so the check-out record has a valid destination.
        await mkdir(checkInOutLogFolderPath, { 'recursive': true });

        // Write the check-out log to disk.
        await writeFile(checkOutLogPath, json.stringify(storedCheckOutLog));

        // Return the created audit log identifier to the caller.
        return storedCheckOutLog.id;
    }

    /**
     * Retrieves a specific audit log entry from persistent storage by its unique ID.
     * @param id Unique identifier of the audit log entry to retrieve.
     * @returns The requested audit log entry.
     */
    public async getCheckInOutLogs(id: CheckInOut['id']): Promise<CheckInOut>;

    /**
     * Retrieves all audit log entries from persistent storage.
     * @returns List of all stored audit log entries.
     */
    public async getCheckInOutLogs(id: never, _filter?: never): Promise<CheckInOut[]>;

    /**
     * Retrieves one audit log entry by its unique identifier or all audit log entries when no log ID is provided.
     * @param id Optional unique identifier of the audit log entry to retrieve.
     * @param _filter Filter used to select a subset of audit logs based on specific criteria. Not currently implemented and should be left undefined.
     * @returns The requested audit log entry or the full audit log list.
     */
    public async getCheckInOutLogs(id?: CheckInOut['id'], _filter?: never): Promise<CheckInOut | CheckInOut[]> {
        // #region Input Validation
        assertGuardEquals(id);

        assertGuardEquals(_filter);
        // #endregion Input Validation

        /** Path to the check-in/check-out log folder in persistent storage. */
        const checkInOutLogFolderPath = this.#calculateFolderPath('checkInOutLog');

        // Pull all of the audit logs if in all mode.
        if (!id) {
            try {
                /** Directory entries inside the check-in/check-out storage folder. */
                const checkInOutFileMetaList = await readdir(checkInOutLogFolderPath, { 'withFileTypes': true });

                /** Computed list of valid check-in/check-out logs loaded from the storage folder. */
                const computedCheckInOutLogList: CheckInOut[] = [];

                // Iterate through each detected file and load them if they are audit log files.
                for (const checkInOutFileMeta of checkInOutFileMetaList) {
                    // Only operate on JSON files.
                    if (checkInOutFileMeta.isFile() && checkInOutFileMeta.name.toLowerCase().endsWith('.json')) {
                        /** Raw text data straight from the audit log file to be validated (untrusted). */
                        const rawCheckInOutContent = await readFile(join(checkInOutLogFolderPath, checkInOutFileMeta.name), 'utf8');

                        // Gracefully parse the audit log file and add it to the computed list if valid, otherwise skip it and continue loading the remaining files.
                        try {
                            /** Parsed audit log object from the raw JSON content. */
                            const parsedCheckInOutLog = json.assertParse<CheckInOut>(rawCheckInOutContent);

                            // Add the log entry to the computed list.
                            computedCheckInOutLogList.push(parsedCheckInOutLog);
                        } catch (_error) {
                            // Skip the file if it fails validation.
                        }
                    }
                }

                // Return the list of audit log entries to the caller.
                return computedCheckInOutLogList;
            } catch (error) {
                // If the directory is missing, return an empty list to indicate that there are no audit logs instead of throwing an error.
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') { return []; }

                // Otherwise throw the error up a level as it is unexpected and not something that can be handled gracefully here.
                throw error;
            }
        }

        /** Raw text data straight from the audit log file to be validated (untrusted). */
        const rawCheckInOutContent = await readFile(join(checkInOutLogFolderPath, `${ id }.json`), 'utf8');

        /** Parsed audit log object from the raw JSON content. */
        const parsedCheckInOutLog = json.assertParse<CheckInOut>(rawCheckInOutContent);

        // Return the parsed audit log entry to the caller.
        return parsedCheckInOutLog;
    }

    /**
     * Creates a new member or updates (upsert) an existing member in persistent storage.
     * @param member The member data to store. If an ID is not provided, one will be generated.
     * @returns The stored member with a unique ID.
     */
    public async createMember(member: Member | Omit<Member, 'id'>): Promise<Member> {
        // #region Input Validation
        assertGuardEquals(member);
        // #endregion Input Validation

        /** Captures the member with a guaranteed unique ID for persistent storage. */
        const storedMember: Member = {
            ...member,
            'id': 'id' in member ? member.id : randomUUID()
        };

        /** Path to the member's JSON file in the persistent storage. */
        const memberPath = join(this.#calculateFolderPath('member'), `${ storedMember.id }.json`);

        // Write the member to disk, replacing any existing record for the same ID.
        await writeFile(memberPath, json.stringify(storedMember));

        // Returns the stored member to the caller, which includes the generated unique ID when one was not provided.
        return storedMember;
    }

    /**
     * Retrieves a specific member from persistent storage by their unique ID.
     * @param id Unique identifier of the member to retrieve.
     * @returns The requested member.
     */
    public async getMember(id: Member['id']): Promise<Member>;

    /**
     * Retrieves all members from persistent storage.
     * @returns List of all stored members.
     */
    public async getMember(id: never, _filter?: never): Promise<Member[]>;

    /**
     * Retrieves one member by ID or all members when no ID is provided.
     * @param id Optional unique identifier of the member to retrieve.
     * @param _filter Filter used to select a subset of members based on specific criteria. Not currently implemented and should be left undefined.
     * @returns The requested member or the full member list.
     */
    public async getMember(id?: Member['id'], _filter?: never): Promise<Member | Member[]> {
        // #region Input Validation
        assertGuardEquals(id);

        assertGuardEquals(_filter);
        // #endregion Input Validation

        // Pull all of the members if in all mode
        if (!id) {
            try {
                /** Directory entries inside the member storage folder. */
                const memberFileMetaList = await readdir(this.#calculateFolderPath('member'), { 'withFileTypes': true });

                /** Computed list of valid members loaded from the storage folder. */
                const computedMemberList: Member[] = [];

                // Iterate through each detected file and load them if they are member files
                for (const memberFileMeta of memberFileMetaList) {
                    // Only operate on JSON files
                    if (memberFileMeta.isFile() && memberFileMeta.name.toLowerCase().endsWith('.json')) {
                        /** Raw text data straight from the member file to be validated (untrusted). */
                        const rawMemberContent = await readFile(join(this.#calculateFolderPath('member'), memberFileMeta.name), 'utf8');

                        // Gracefully parse the member file and add it to the computed member list if valid, otherwise skip it and move on to the next file without halting the entire load process if a single file is invalid.
                        try {
                            /** Parsed member object from the raw JSON content. */
                            const member = json.assertParse<Member>(rawMemberContent);

                            // Add the member to the computed member list
                            computedMemberList.push(member);
                        } catch (_error) {
                            // Skip the the file if it fails validation
                        }
                    }
                }

                // Return the list of members to the caller after iterating through all of the files in the member storage folder and loading the valid ones, which may be an empty list if no valid member files were found.
                return computedMemberList;
            } catch (error) {
                // If the directory is missing, return an empty list to indicate that there are no members instead of throwing an error, as the missing directory is effectively the same state as an empty member list.
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') { return []; }

                // Otherwise throw the error up a level as it is unexpected and not something that can be handled gracefully here.
                throw error;
            }
        }

        /** Raw text data straight from the member file to be validated (untrusted). */
        const rawMemberContent = await readFile(join(this.#calculateFolderPath('member'), `${ id }.json`), 'utf8');

        /** Parsed member object from the raw JSON content. */
        const parsedMember = json.assertParse<Member>(rawMemberContent);

        // Return the parsed member to the caller
        return parsedMember;
    }

    /**
     * Deletes a member from persistent storage by their unique ID.
     * @param id Unique identifier of the member to delete.
     */
    public async deleteMember(id: Member['id']): Promise<void> {
        // #region Input Validation
        assertGuardEquals(id);
        // #endregion Input Validation

        /** Path to the member's JSON file in persistent storage. */
        const memberPath = join(this.#calculateFolderPath('member'), `${ id }.json`);

        // Attempt graceful deletion of the member
        try {
            // Delete the requested member
            await unlink(memberPath);
        } catch (_error) {
            // Do nothing if the delete fails or if the file is not present
        }
    }

    /*
     * Helper functions
     */
    // #region Helper Functions

    /**
     * Calculates the full path to a specific folder type based on the current settings.
     * @param folderType Flag that indicates which path to calculate based on the current settings.
     * @returns Full path to the requested folder type.
     */
    #calculateFolderPath(folderType: 'checkInOutLog' | 'member'): string {
        // #region Input Validation
        assertGuardEquals(folderType);
        // #endregion Input Validation

        /** Computed folder path based on the folder type and current settings. */
        let computedFolderPath = this.#settingsEngine.appDataPath;

        // Apply the appropriate subfolder based on the folder type, and use the default subfolder if a custom path is not provided in the settings, which allows for both a sensible default and user customization when needed.
        switch (folderType) {
            case 'checkInOutLog':
                // Check if a custom audit log folder path is provided in the settings, and if not, use the default 'auditLogs' subfolder within the app data path to store the audit logs, which keeps them organized and separate from other types of data.
                if (!this.#settingsEngine.currentSettings.checkInLogFolderPath) {
                    // Default to using a sub folder within the app's data directory by default
                    computedFolderPath = join(computedFolderPath, 'checkInLogs');
                } else {
                    // If specified, use the custom folder instead of the default location
                    computedFolderPath = this.#settingsEngine.currentSettings.checkInLogFolderPath;
                }

                // Stop execution to prevent fallthrough
                break;
            case 'member':
                // Check if a custom member folder path is provided in the settings, and if not, use the default 'members' subfolder within the app data path to store the member records, which keeps them organized and separate from other types of data.
                if (!this.#settingsEngine.currentSettings.memberFolderPath) {
                    // Default to using a sub folder within the app's data directory by default
                    computedFolderPath = join(computedFolderPath, 'members');
                } else {
                    // If specified, use the custom folder instead of the default location
                    computedFolderPath = this.#settingsEngine.currentSettings.memberFolderPath;
                }

                // Stop execution to prevent fallthrough
                break;
            default:
                // This should never be reached due to the input validation, but is necessary to satisfy the exhaustiveness requirement of the switch statement.
                break;
        }

        // Return the calculated folder path to the caller after applying the appropriate subfolder based on the folder type
        return computedFolderPath;
    }
    // #endregion Helper Functions
}
