// Backend Configuration
// Centralized URLs and constants for the backend application

export const CONFIG = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Frontend URLs
  FRONTEND: {
    BASE_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    SETTINGS: '/settings',
    ACCOUNTS: '/accounts',
  },
  
  // Backend URLs
  BACKEND: {
    BASE_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  },
  
  // OAuth Configuration
  OAUTH: {
    FACEBOOK: {
      APP_ID: process.env.FACEBOOK_APP_ID,
      APP_SECRET: process.env.FACEBOOK_APP_SECRET,
      REDIRECT_URI: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/social/auth/facebook/callback`,
      FRONTEND_REDIRECT: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accounts`,
      SCOPE: 'pages_show_list,pages_read_engagement,pages_manage_posts',
      API_VERSION: 'v19.0',
    },
  },
  
  // Redis Configuration (for BullMQ)
  REDIS: {
    URL: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'supersecret',
  },
  
  // Facebook Graph API
  FACEBOOK_API: {
    BASE_URL: 'https://graph.facebook.com',
    VERSION: 'v19.0',
  },
};

// Helper function to get full Facebook API URL
export const getFacebookApiUrl = (endpoint: string): string => {
  return `${CONFIG.FACEBOOK_API.BASE_URL}/${CONFIG.FACEBOOK_API.VERSION}${endpoint}`;
};
