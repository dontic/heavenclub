// @ts-nocheck
import type { UserCreate, UserCreateRequest, UserList } from '../api.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * List all users with their information
 */
export const invitationsList = (options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<UserList[]>({ url: `/api/invitations/`, method: 'GET' }, options);
};
/**
 * Create a new user
 */
export const invitationsCreate = (
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
export const invitationsDestroy = (email: string, options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<void>({ url: `/api/invitations/${email}/`, method: 'DELETE' }, options);
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type InvitationsListResult = NonNullable<Awaited<ReturnType<typeof invitationsList>>>;
export type InvitationsCreateResult = NonNullable<Awaited<ReturnType<typeof invitationsCreate>>>;
export type InvitationsDestroyResult = NonNullable<Awaited<ReturnType<typeof invitationsDestroy>>>;
