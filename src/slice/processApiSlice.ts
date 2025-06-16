import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface ProcessMetricsParams {
  orgId: number;
  startDate: number;
  endDate: number;
  authorIds?: number[];
  teamIds?: number[];
  repoIds?: number[];
  branch?: string[];
  periodType?: 'daily' | 'weekly' | 'monthly';
  showMergedPrs?: boolean;
}

interface PhaseMetrics {
  time: string; // Format: "2d 12h" or "4m"
  count: number;
}

interface ProcessMetricsResponse {
  codingTime: string;
  pickupTime: string;
  cycleTime: string;
  prCount: number;
  prsWithComments: number;
  codingPhase: PhaseMetrics;
  pickupPhase: PhaseMetrics;
  reviewPhase: PhaseMetrics;
  mergePhase: PhaseMetrics;
}

export const processApiSlice = createApi({
  reducerPath: 'processApi',
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
  endpoints: (builder) => ({
    getProcessMetrics: builder.query<ProcessMetricsResponse, ProcessMetricsParams>({
      query: (params) => ({
        url: '/process/pullrequest',
        method: 'POST', // Changed to POST to handle larger payloads
        body: {
          ...params,
          periodType: params.periodType || 'weekly',
          showMergedPrs: true,
          advancedFilters: {},
          projectIds: []
        }
      }),
      transformResponse: (response: any) => {
        // Transform the response to match our interface
        return {
          ...response,
          pickupTime: response.pickupTime || '0m',
          codingTime: response.codingTime || '0h 0m',
          cycleTime: response.cycleTime || '0h 0m',
          prCount: response.prCount || 0,
          prsWithComments: response.prsWithComments || 0,
          codingPhase: response.codingPhase || { time: '0h 0m', count: 0 },
          pickupPhase: response.pickupPhase || { time: '0m', count: 0 },
          reviewPhase: response.reviewPhase || { time: '0h 0m', count: 0 },
          mergePhase: response.mergePhase || { time: '0h 0m', count: 0 }
        };
      }
    }),
  }),
});

export const { useGetProcessMetricsQuery } = processApiSlice;