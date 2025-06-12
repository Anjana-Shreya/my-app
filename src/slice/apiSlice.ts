import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginPayload, LoginResponse } from '../types/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://app.insightlyanalytics.ai/hivelapi',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/login/native',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = api;