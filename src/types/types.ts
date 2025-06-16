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
  isPublic?: boolean;
  isFavorite?: boolean;
  dashboardName?: string;
  name?: string;
  description?: string;
  widgets?: any[];
  metrics?: any[];
  owner?: string;
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

export type Team = {
  id: number,
  name: string
}

export interface Author {
  id: number;
  name: string;
}

export interface GitRepo {
  name: string;
  branches: string[];
}

export interface SelectOption {
  value: number | string;
  label: string;
}

export type ProcessPoint = {
  period: string; // e.g. "05/05"
  codingTime: number;     // in seconds
  reviewedTime: number;
  deployTime: number;
  cycleTime: number;
};
