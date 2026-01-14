/**
 * API Endpoints constants
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },

  // Projects
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    BY_USER: (userId: string) => `/projects?userId=${userId}`,
    MEMBERS: (projectId: string) => `/projects/${projectId}/members`,
  },

  // Issues
  ISSUES: {
    BASE: '/issues',
    BY_ID: (id: string) => `/issues/${id}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/issues`,
    COMMENTS: (issueId: string) => `/issues/${issueId}/comments`,
    ATTACHMENTS: (issueId: string) => `/issues/${issueId}/attachments`,
  },

  // Boards
  BOARDS: {
    BASE: '/boards',
    BY_ID: (id: string) => `/boards/${id}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/boards`,
  },

  // Sprints
  SPRINTS: {
    BASE: '/sprints',
    BY_ID: (id: string) => `/sprints/${id}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/sprints`,
  },
} as const;