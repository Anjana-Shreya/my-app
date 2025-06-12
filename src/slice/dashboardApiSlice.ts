// src/slices/dashboardApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DashboardTemplate } from '../types/types';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://app.insightlyanalytics.ai/hivelapi',
    prepareHeaders: (headers) => {
      const authData = localStorage.getItem('auth');
      if (!authData) return headers;
      
      const parsedAuth = JSON.parse(authData);
      
      if (parsedAuth?.user?.authToken) {
        headers.set('authorization', `Bearer ${parsedAuth.user.authToken}`);
      }
      if (parsedAuth?.accessToken || parsedAuth?.user?.accessToken) {
        headers.set('x-access-token', parsedAuth.accessToken || parsedAuth.user.accessToken);
      }
      if (parsedAuth?.user?.id) {
        headers.set('x-user-id', parsedAuth.user.id.toString());
      }
      if (parsedAuth?.user?.organization?.id) {
        headers.set('x-organization-id', parsedAuth.user.organization.id.toString());
      }
      
      headers.set('accept', '*/*');
      headers.set('x-timezone', 'Asia/Calcutta');
      
      return headers;
    }
  }),
  tagTypes: ['Templates'],
  endpoints: (builder) => ({
    getOrgTemplates: builder.query<DashboardTemplate[], number>({
      query: (orgId) => `/dashboards/templates/org/${orgId}`,
      providesTags: ['Templates'],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.data) return response.data;
        return [];
      }
    }),
  }),
});

export const { useGetOrgTemplatesQuery } = dashboardApi;