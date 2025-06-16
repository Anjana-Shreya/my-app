// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../slice/apiSlice';
import { dashboardApi } from '../slice/dashboardApiSlice';
import authReducer from '../slice/authSlice';
import templatesReducer from '../slice/templateSlice';
import { teamApi } from '../slice/teamApiSlice';
import { metricsApi } from '../slice/metricsApiSlice';
// import { detailsApiSlice } from '../slice/detailsSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [metricsApi.reducerPath]: metricsApi.reducer,
    // [detailsApiSlice.reducerPath]: detailsApiSlice.reducer,
    auth: authReducer,
    templates: templatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(dashboardApi.middleware)
      .concat(teamApi.middleware)
      .concat(metricsApi.middleware)
      // .concat(detailsApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;