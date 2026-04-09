import type { tags } from 'typia';

/**
 * Represents the authorization data for a user.
 *
 * This object does not represent that the token has been validated.
 * It is only an extraction of the claims.
 */
export interface AuthorizationData {
    /** Tenant ID of the tenant the principal authenticated from. */
    'tenantId': string & tags.Format<'uuid'>;
    /** Object ID of the principal. */
    'objectId': string & tags.Format<'uuid'>;
    /** List of delegated and application permissions granted to the principal. */
    'permissionList': string[];
}
