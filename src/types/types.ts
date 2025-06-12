export interface LoginPayload {
  initialEmail: string;
  password: string;
}

export interface Organization {
  id: number;
  orgName: string;
}

export interface User {
  id: number;
  userName: string;
  email: string;
  organization: Organization;
  authToken?: string; 
}

export interface LoginResponse {
  user: User;
  accessToken?: string;  
  refreshToken?: string;
  applicationAccess?: boolean;
  isNewUser?: boolean;
}


// ==================================== //

// src/types/types.ts
export interface Metric {
  id: number;
  metricName: string;
  metricKey: string;
  metricTableKey: string;
  metricDescription: string;
  metricCategory: string;
  mediaLink: string | null;
  color: string | null;
  yaxisSuffix: string | null;
}

export interface DashboardTemplate {
  id: number;
  templateName: string;
  templateDescription: string | null;
  metricsList: Metric[];
}

export type Dashboard = {
    id: number;
    organizationId: number;
    userId: number;
    dashboardName: string;
    dashboardDescription: string;
    userName: string;
    createdDate: string;
    modifiedDate: string;
    metrics: number[];
    metricsList: Metric[];
    type: string;
}