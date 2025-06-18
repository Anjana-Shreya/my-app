// src/slices/teamApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Author, Team } from '../types/types';

export const teamApi = createApi({
  reducerPath: 'teamApi',
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
    getHierarchicalTeam: builder.query<Team[], { userId: number, orgId: number }>({
      query: ({ userId, orgId }) => `/team/user/${userId}/hierarchical?orgId=${orgId}`,
      transformResponse: (response: any) => {
        let teamData: Team[] = [];

        if (Array.isArray(response)) {
          teamData = response;
        } else if (response?.data) {
          teamData = response.data;
        } else {
          teamData = response || [];
        }

        // Save to localStorage
        localStorage.setItem('team', JSON.stringify(teamData));

        return teamData;
      }
    }),

    getTeamAuthors: builder.mutation<Author[], {
      teamIds: number[],
      startDate: number,
      endDate: number
    }>({
      query: (params) => ({
        url: 'team/authors?orgId=1960',
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      transformResponse: (response: any) => {
        const authors = Array.isArray(response) ? response : response?.data || [];
        localStorage.setItem('authors', JSON.stringify(authors));
        return authors;
      }
    }),

    getBranches: builder.query<string[], { repoIds: number[] }>({
      query: ({ repoIds }) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: `query GetBranches($repoIds: [Int!]!) {
            getBranches(repoIds: $repoIds)
          }`,
          variables: {
            repoIds: repoIds
          }
        }
      }),
      transformResponse: (response: any) => {
        if (!response?.data?.getBranches) {
          console.error('Invalid response format from getBranches', response);
          return [];
        }
        return response.data.getBranches;
      }
    })
  })
});

export const { 
  useGetHierarchicalTeamQuery,
  useGetTeamAuthorsMutation, 
  useGetBranchesQuery
} = teamApi;