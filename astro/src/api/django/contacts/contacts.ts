// @ts-nocheck
import type { Contact, ContactRequest } from '../api.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Create a new contact request
 */
export const contactsCreate = (
  contactRequest: ContactRequest,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<Contact>(
    { url: `/api/contacts/`, method: 'POST', headers: { 'Content-Type': 'application/json' }, data: contactRequest },
    options
  );
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type ContactsCreateResult = NonNullable<Awaited<ReturnType<typeof contactsCreate>>>;
