/** The expected structure of the user data of the logged in user. */
export interface UserData {
    /** The user ID. */
    'id': string;
    /** The user's display name. */
    'displayName': string;
    /** The currently logged in user's principal authentication name, such as UPN, phone number, or client ID. */
    'principalAuthName': string;
    /** Base64 encoded URL of the user's profile picture. */
    'userProfilePicture': string | undefined;
}
