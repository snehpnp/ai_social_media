// Frontend Configuration
// Centralized URLs and constants for the application

export const CONFIG = {
  // API Base URL
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // API Endpoints
  API: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    
    // Posts
    POSTS: '/api/posts',
    POST_BY_ID: (id: string) => `/api/posts/${id}`,
    PUBLISH_POST: (id: string) => `/api/posts/${id}/publish`,
    
    // Social
    SOCIAL_ACCOUNTS: '/api/social/accounts',
    FACEBOOK_PAGE_INFO: '/api/social/facebook/page-info',
    FACEBOOK_AUTH: '/api/social/auth/facebook',
    FACEBOOK_CALLBACK: '/api/social/auth/facebook/callback',
    DELETE_ACCOUNT: (platform: string) => `/api/social/accounts/${platform}`,
    
    // Admin
    ADMIN_SETTINGS: '/api/admin/settings',
    ADMIN_USERS: '/api/admin/users',
    
    // Dashboard
    DASHBOARD_STATS: '/api/dashboard/stats',
    
    // AI Providers
    AI_PROVIDERS: '/api/ai-providers',
    AI_GENERATE: '/api/ai-providers/generate',
  },
  
  // Frontend URLs
  FRONTEND: {
    BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    SETTINGS: '/settings',
    ACCOUNTS: '/accounts',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    POSTS: '/posts',
    CREATE_POST: '/posts/create',
    ANALYTICS: '/analytics',
    SCHEDULER: '/scheduler',
    ADMIN_SETTINGS: '/admin-settings',
    AI_CONFIG: '/ai-config',
    SOCIAL_CONFIG: '/social-config',
    USERS: '/users',
  },
  
  // OAuth Redirect URLs
  OAUTH: {
    FACEBOOK_REDIRECT: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/accounts`,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${CONFIG.API_BASE_URL}${endpoint}`;
};

// Helper function to get full frontend URL
export const getFrontendUrl = (path: string): string => {
  return `${CONFIG.FRONTEND.BASE_URL}${path}`;
};
