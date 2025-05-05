// @ts-nocheck
import type { Invitation, InvitationCreate, InvitationCreateRequest } from '../api.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * ViewSet for managing invitations
- Create: Create a new invitation
- Destroy: Delete an invitation
 */
export const invitationsList = (options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<Invitation[]>({ url: `/api/invitations/`, method: 'GET' }, options);
};
/**
 * Create a new invitation
 */
export const invitationsCreate = (
  invitationCreateRequest: InvitationCreateRequest,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<InvitationCreate>(
    {
      url: `/api/invitations/`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: invitationCreateRequest,
    },
    options
  );
};
/**
 * Delete invitation and associated user
 */
export const invitationsDestroy = (user: number, options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<void>({ url: `/api/invitations/${user}/`, method: 'DELETE' }, options);
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type InvitationsListResult = NonNullable<Awaited<ReturnType<typeof invitationsList>>>;
export type InvitationsCreateResult = NonNullable<Awaited<ReturnType<typeof invitationsCreate>>>;
export type InvitationsDestroyResult = NonNullable<Awaited<ReturnType<typeof invitationsDestroy>>>;
