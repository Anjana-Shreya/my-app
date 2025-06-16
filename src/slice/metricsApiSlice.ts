// src/slices/metricsApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface TimeMetric {
  period: string;
  year: number;
  month: number;
  week: number | null;
  day: number;
  dayOfWeek: string;
  generated: boolean;
  codingTime: number;
  reviewedTime: number;
  deployTime: number;
  reviewedToMergedDurationTotal: number;
  openToMergedDurationTotal: number;
  openToDeclineDurationTotal: number;
  reviewedToDeclineDurationTotal: number;
  commitToOpenCount: number;
  openToReviewCount: number;
  openToMergedCount: number;
  reviewedToMergedCount: number;
  openToDeclineDurationCount: number;
  deployTimeCount: number;
  reviewedToDeclineDurationCount: number;
  cycleTimeDurationCount: number;
  openToFirstCommentDurationTotal: number;
  openToFirstCommentDurationCount: number;
  commentedPrsCount: number;
  eventDate: string;
  cycleTime: number;
}

interface MetricData {
  metrics: TimeMetric[];
}

interface ProcessMetricsParams {
  repoIds: string[];
  startDate: number;
  endDate: number;
  authorIds: number[];
  teamIds: number[];
  branch: string[];
}

export const metricsApi = createApi({
  reducerPath: 'metricsApi',
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
    getProcessMetrics: builder.query<MetricData, ProcessMetricsParams>({
      query: (params) => ({
        url: '/metric/process',
        method: 'POST',
        body: {
          ...params,
          userId: 4459, // Make dynamic if possible
          organizationId: 1960,
          periodType: "weekly", 
          projectIds: [],
          advancedFilters: {},
          showMergedPrs: true
        }
      }),
      transformResponse: (response: any) => {
        localStorage.setItem('metricsData', JSON.stringify(response));
        return response;
      }
    })
  })
});

export const { useGetProcessMetricsQuery } = metricsApi;