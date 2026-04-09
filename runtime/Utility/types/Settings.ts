import type { tags } from 'typia';

/** Represents the current settings for the application that are stored on non-volatile memory. */
export interface CurrentSettings {
    /**
     * Client ID used for authenticating the end user.
     * Required to be configured before use.
     * @default NULL_UUID
     */
    'clientId': string & tags.Format<'uuid'>;
    /**
     * Tenant ID used to authenticate the end user.
     * Required to be configured if app registration is in single tenant mode. Can be left as 'common' if the app registration is multi-tenant.
     * @default 'common'
     */
    'tenantId': string & tags.Format<'uuid'> | 'common';
    /**
     * Path to the folder where the check in and check out logs are stored.
     * Stores the logs in the same folder the settings file is stored if left undefined.
     * @default undefined
     */
    'logFolderPath': string | undefined;
    /**
     * Path to the folder where member records are stored.
     * Stores the records in the same folder the settings file is stored if left undefined.
     * @default undefined
     */
    'memberFolderPath': string | undefined;
    /** Version of the settings schema.*/
    'version': number;
}
