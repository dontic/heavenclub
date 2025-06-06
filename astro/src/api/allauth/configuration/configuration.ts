/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * django-allauth: Headless API
 * Allauth spec
 * OpenAPI spec version: 1
 */
import type { ConfigurationResponse } from '../djangoAllauthHeadlessAPI.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * There are many configuration options that alter the functionality
and behavior of django-allauth, some of which can also impact the
frontend. Therefore, relevant configuration options are exposed via
this endpoint. The data returned is not user/authentication
dependent. Hence, it suffices to only fetch this data once at boot
time of your application.

 * @summary Get configuration
 */
export const getAllauthClientV1Config = (
  client: 'app' | 'browser',
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<ConfigurationResponse>({ url: `/_allauth/${client}/v1/config`, method: 'GET' }, options);
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type GetAllauthClientV1ConfigResult = NonNullable<Awaited<ReturnType<typeof getAllauthClientV1Config>>>;
