// @ts-nocheck
/**
 * Serializer for Contact model
 */
export interface Contact {
  /** @maxLength 255 */
  name: string;
  /** @maxLength 254 */
  email: string;
  /** @maxLength 50 */
  phone?: string;
  message: string;
}

/**
 * Serializer for Contact model
 */
export interface ContactRequest {
  /**
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * @minLength 1
   * @maxLength 254
   */
  email: string;
  /** @maxLength 50 */
  phone?: string;
  /** @minLength 1 */
  message: string;
}

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
  readonly last_accessed: string | null;
  readonly created_at: string;
}
