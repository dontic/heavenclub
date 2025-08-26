// @ts-nocheck
import type { Contact, ContactRequest, UserCreate, UserCreateRequest, UserList } from '../api.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Create a new contact request
 */
export const apiContactsCreate = (
  contactRequest: ContactRequest,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<Contact>(
    { url: `/api/contacts/`, method: 'POST', headers: { 'Content-Type': 'application/json' }, data: contactRequest },
    options
  );
};
/**
 * List all users with their information
 */
export const apiInvitationsList = (options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<UserList[]>({ url: `/api/invitations/`, method: 'GET' }, options);
};
/**
 * Create a new user
 */
export const apiInvitationsCreate = (
  userCreateRequest: UserCreateRequest,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<UserCreate>(
    {
      url: `/api/invitations/`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: userCreateRequest,
    },
    options
  );
};
/**
 * Delete user by email
 */
export const apiInvitationsDestroy = (email: string, options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<void>({ url: `/api/invitations/${email}/`, method: 'DELETE' }, options);
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type ApiContactsCreateResult = NonNullable<Awaited<ReturnType<typeof apiContactsCreate>>>;
export type ApiInvitationsListResult = NonNullable<Awaited<ReturnType<typeof apiInvitationsList>>>;
export type ApiInvitationsCreateResult = NonNullable<Awaited<ReturnType<typeof apiInvitationsCreate>>>;
export type ApiInvitationsDestroyResult = NonNullable<Awaited<ReturnType<typeof apiInvitationsDestroy>>>;
