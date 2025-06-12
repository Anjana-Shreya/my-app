import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginResponse, User } from '../types/types';

// Load initial state from localStorage
const loadInitialState = () => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('auth');
    return storedData ? JSON.parse(storedData) : { user: null, token: null };
  }
  return { user: null, token: null };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('auth', JSON.stringify(state));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: { user: User } }) => state.auth.user;
export const selectCurrentToken = (state: { auth: { token: string } }) => state.auth.token;