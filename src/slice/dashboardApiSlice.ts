// src/slices/dashboardApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DashboardTemplate } from '../types/types';

interface GraphRequestParams {
  userId: number;
  orgId: number;
  organizationId: number;
  startDate: number; // Unix timestamp
  endDate: number;   // Unix timestamp
  filterType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  teamIds: number[];
  projectIds: number[];
  advancedFilters: Record<string, any>;
}

interface GraphResponse {
  data: {
    categories: string[];
    series: {
      name: string;
      data: number[];
      color?: string;
    }[];
  };
  success: boolean;
  message?: string;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://app.insightlyanalytics.ai/hivelapi',
    prepareHeaders: (headers) => {
      const authData = localStorage.getItem('auth');
      if (!authData) return headers;
      
      const parsedAuth = JSON.parse(authData);
      
      headers.set('accept', '*/*');
      headers.set('content-type', 'application/json');
      headers.set('x-timezone', 'Asia/Calcutta');
      
      if (parsedAuth?.user?.authToken) {
        headers.set('authorization', `Bearer ${parsedAuth.user.authToken}`);
      }
      if (parsedAuth?.accessToken || parsedAuth?.user?.accessToken) {
        headers.set('x-access-token', parsedAuth.accessToken || parsedAuth.user.accessToken);
      }
      if (parsedAuth?.user?.id) {
        headers.set('userid', parsedAuth.user.id.toString());
        headers.set('x-user-id', parsedAuth.user.id.toString());
      }
      if (parsedAuth?.user?.organization?.id) {
        headers.set('x-organization-id', parsedAuth.user.organization.id.toString());
      }
      
      return headers;
    }
  }),
  tagTypes: ['Dashboards', 'MetricData'],
  endpoints: (builder) => ({
    // Existing endpoints...
    getOrgTemplates: builder.query<DashboardTemplate[], number>({
      query: (orgId) => `/dashboards/templates/org/${orgId}`,
      providesTags: ['Dashboards']
    }),
    
    getUserDashboards: builder.query<any, { orgId: number, userId: number }>({
      query: ({ orgId, userId }) => `/dashboards/${orgId}/user/${userId}`,
      providesTags: ['Dashboards']
    }),
    
    getMetricGraphData: builder.query<any, { metricKey: string; params: any }>({
    query: ({ metricKey, params }) => ({
      url: `/graph/${metricKey}`,
      method: 'POST',
      body: params
    }),
    providesTags: (result, error, { metricKey }) => [{ type: 'MetricData', id: metricKey }]
  }),
  }),
});

export const { 
  useGetOrgTemplatesQuery, 
  useGetUserDashboardsQuery,
  useGetMetricGraphDataQuery
} = dashboardApi;