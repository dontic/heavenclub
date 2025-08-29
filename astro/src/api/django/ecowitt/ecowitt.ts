// @ts-nocheck
import type {
  EcowittHistoryListParams,
  EcowittObservation,
  EcowittObservation5Min,
  EcowittObservationRequest,
} from '../api.schemas';

import { customAxiosInstance } from '../../axios';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Ingest Ecowitt observation payload via POST
 */
export const ecowittCreate = (
  ecowittObservationRequest: EcowittObservationRequest,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<EcowittObservation>(
    {
      url: `/ecowitt/`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: ecowittObservationRequest,
    },
    options
  );
};
/**
 * Get aggregated 5-minute observations for a given date in Madrid timezone
 */
export const ecowittHistoryList = (
  params: EcowittHistoryListParams,
  options?: SecondParameter<typeof customAxiosInstance>
) => {
  return customAxiosInstance<EcowittObservation5Min[]>({ url: `/ecowitt/history`, method: 'GET', params }, options);
};
/**
 * Get the latest Ecowitt observation via GET
 */
export const ecowittRealtimeRetrieve = (options?: SecondParameter<typeof customAxiosInstance>) => {
  return customAxiosInstance<EcowittObservation>({ url: `/ecowitt/realtime`, method: 'GET' }, options);
};

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type EcowittCreateResult = NonNullable<Awaited<ReturnType<typeof ecowittCreate>>>;
export type EcowittHistoryListResult = NonNullable<Awaited<ReturnType<typeof ecowittHistoryList>>>;
export type EcowittRealtimeRetrieveResult = NonNullable<Awaited<ReturnType<typeof ecowittRealtimeRetrieve>>>;
