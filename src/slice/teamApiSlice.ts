// src/slices/teamApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Author, Team, GitRepo } from '../types/types';

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

		getGitRepos: builder.query<string[], { repoIds: number[] }>({
			query: ({ repoIds }) => ({
				url: '/graphql',
				method: 'POST',
				body: {
					query: `
						query GetRepos($repoIds: [Int!]!) {
							getBranches(repoIds: $repoIds)
						}
					`,
					variables: { repoIds }
				},
				headers: {
					'Content-Type': 'application/json'
				}
			}),
				transformResponse: (response: any) => {
					const branches = response?.data?.getBranches || [];
					localStorage.setItem('branches', JSON.stringify(branches));
					localStorage.setItem('repoIds', JSON.stringify([
					23352,23332,23307,23327,23337,23342,23347,23312,23317,23302,
					23322,23318,23303,23313,23308,23323,23333,23338,23343,23348,
					23328,23353,23354,23309,23329,23349,23314,23304,23334,23339,
					23344,23324,23319,23310,23330,23305,23350,23315,23335,23320,
					23340,23345,23325,23346,23331,23316,23336,23306,23326,23351,
					23341,23311,23321
				]));
				return branches;
			}
		})
  })
});

export const { 
  useGetHierarchicalTeamQuery,
  useGetTeamAuthorsMutation, 
	useGetGitReposQuery
} = teamApi;