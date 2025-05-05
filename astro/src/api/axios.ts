// Custom instance of axios

import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.PROD ? 'https://api.heavenclub.es' : 'http://10.11.12.21:8000';

export const customAxios = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export const customAxiosInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = customAxios({
    ...config,
    ...options,
    paramsSerializer: {
      indexes: null,
    },
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
