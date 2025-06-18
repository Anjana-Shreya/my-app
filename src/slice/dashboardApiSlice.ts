// src/slice/dashboardApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DashboardTemplate } from '../types/types';

interface GraphRequestParams {
  userId: number;
  orgId: number;
  organizationId: number;
  startDate: number; // Unix timestamp
  endDate: number;   // Unix timestamp
  filterType: 'daily' | 'weekly' | 'monthly';
  teamIds: number[];
  projectIds: number[];
  advancedFilters: Record<string, any>;
}

interface MetricSummaryResponse {
  benchmarkInfo: {
    High: string;
    Low: string;
    Medium: string;
    Elite: string;
  };
  CockpitGraphData: {
    percentage: number;
    weekNo: number;
    formattedDate: string;
    totalMetricCount: number;
    totalCount: number;
  }[];
  benchMarkResult: string;
  changePercentage: string | number;
  primaryValue: number;
}

interface TeamMetricResponse {
  // Define the response structure for the /overview/v2/team/metric endpoint
  // Adjust based on actual API response
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
  tagTypes: ['Dashboards', 'MetricData', 'MetricDetails', 'TeamMetrics'],
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
    
    getMetricGraphData: builder.query<MetricSummaryResponse, { metricKey: string; params: GraphRequestParams }>({
      query: ({ metricKey, params }) => ({
        url: `/graph/${metricKey}`,
        method: 'POST',
        body: params
      }),
      providesTags: (result, error, { metricKey }) => [{ type: 'MetricData', id: metricKey }]
    }),

    // New endpoint for /overview/v2/team/metric
    getTeamMetrics: builder.query<TeamMetricResponse, GraphRequestParams & { metricType: string }>({
      query: (params) => ({
        url: '/overview/v2/team/metric',
        method: 'POST',
        body: {
          startDate: params.startDate,
          endDate: params.endDate,
          metricType: params.metricType,
          mainTeamMetric: true,
          teamIds: params.teamIds,
          organizationId: params.organizationId,
          authorIds: [],
          groupBy: params.filterType,
          projectIds: params.projectIds,
          advancedFilters: params.advancedFilters,
          signal: {}
        }
      }),
      providesTags: (result, error, params) => [{ type: 'TeamMetrics', id: params.metricType }]
    }),

    getMetricDetails: builder.query<MetricSummaryResponse, GraphRequestParams & { metricType: string }>({
      query: (params) => ({
        url: '/overview/v2/team/metric-summary',
        method: 'POST',
        body: params
      }),
      providesTags: (result, error, params) => [{ type: 'MetricDetails', id: params.metricType }]
    }),

    getBenchmarkData: builder.query<any, { metricType: string; teamIds: number[] }>({
      query: ({ metricType, teamIds }) => ({
        url: '/benchmark/data',
        method: 'POST',
        body: { metricType, teamIds }
      }),
      providesTags: ['MetricData']
    }),

    updateUserPreferences: builder.mutation({
      query: (payload) => ({
        url: '/user/update-user-preferences',
        method: 'PUT',
        body: payload          
      }),
      transformResponse: (response: any) => {
        return response;
      }
    })
  }),
});

export const { 
  useGetOrgTemplatesQuery, 
  useGetUserDashboardsQuery,
  useGetMetricGraphDataQuery,
  useGetTeamMetricsQuery,
  useGetMetricDetailsQuery,
  useGetBenchmarkDataQuery,
  useUpdateUserPreferencesMutation
} = dashboardApi;