import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginResponse } from '../types/types';

const loadInitialState = () => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('auth');
    return storedData ? JSON.parse(storedData) : null;
  }
  return null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      const authData = action.payload;
      localStorage.setItem('auth', JSON.stringify(authData));
      return authData; 
    },
    logout: () => {
      localStorage.removeItem('auth');
      return null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: LoginResponse }) => state.auth?.user;
export const selectCurrentToken = (state: { auth: LoginResponse }) => state.auth?.accessToken || state.auth?.user?.authToken;
