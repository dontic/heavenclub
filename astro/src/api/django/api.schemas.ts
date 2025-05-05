// @ts-nocheck
/**
 * Serializer for creating users (replacing invitation creation)
 */
export interface UserCreate {
  email: string;
  send_email?: boolean;
}

/**
 * Serializer for creating users (replacing invitation creation)
 */
export interface UserCreateRequest {
  /** @minLength 1 */
  email: string;
  send_email?: boolean;
}

/**
 * Serializer for listing users
 */
export interface UserList {
  readonly email: string;
  /** @nullable */
  readonly last_login: string | null;
  readonly created_at: string;
}
