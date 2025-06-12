// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../slice/apiSlice';
import { dashboardApi } from '../slice/dashboardApiSlice';
import authReducer from '../slice/authSlice';
import templatesReducer from '../slice/templateSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    auth: authReducer,
    templates: templatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(dashboardApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;