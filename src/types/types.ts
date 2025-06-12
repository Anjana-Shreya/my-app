export interface User {
  id: string;
  initialEmail: string;
  name?: string;
}

export interface LoginPayload {
  initialEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardTemplate {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  // Add other fields based on your API response
}