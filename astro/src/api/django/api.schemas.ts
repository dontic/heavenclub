// @ts-nocheck
/**
 * Serializer for the Invitation model
 */
export interface Invitation {
  readonly email: string;
  readonly invitation_accepted: boolean;
  /** @nullable */
  readonly invitation_accepted_at: string | null;
  readonly created_at: string;
}

/**
 * Serializer for creating invitations
 */
export interface InvitationCreate {
  email: string;
  send_email?: boolean;
}

/**
 * Serializer for creating invitations
 */
export interface InvitationCreateRequest {
  /** @minLength 1 */
  email: string;
  send_email?: boolean;
}
