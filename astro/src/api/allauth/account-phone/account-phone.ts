/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * django-allauth: Headless API
 * Allauth spec
 * OpenAPI spec version: 1
 */
import type { PhoneBody, PhoneNumberChangeResponse, PhoneNumbersResponse } from '../djangoAllauthHeadlessAPI.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Retrieves the phone number of the account, if any. Note that while the
endpoint returns a list of phone numbers, at most one entry is returned.

 * @summary Get the phone number
 */
export const getAllauthClientV1AccountPhone = (
  client: 'app' | 'browser',
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<PhoneNumbersResponse>(
    { url: `/_allauth/${client}/v1/account/phone`, method: 'GET' },
    options
  );
};
/**
 * Initiate the phone number change process. After posting a new phone
number, proceed with the phone verification endpoint to confirm the
change of the phone number by posting the verification code.

 * @summary Change the phone number

 */
export const postAllauthClientV1AccountPhone = (
  client: 'app' | 'browser',
  phoneBody: PhoneBody,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<PhoneNumberChangeResponse>(
    {
      url: `/_allauth/${client}/v1/account/phone`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: phoneBody,
    },
    options
  );
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type GetAllauthClientV1AccountPhoneResult = NonNullable<
  Awaited<ReturnType<typeof getAllauthClientV1AccountPhone>>
>;
export type PostAllauthClientV1AccountPhoneResult = NonNullable<
  Awaited<ReturnType<typeof postAllauthClientV1AccountPhone>>
>;
