// App Configuration
export const APP_CONFIG = {
  // Static configuration
  name: 'placeholder',
  version: '1.0.0',
  pageSizeOptions: [10, 20, 50, 100],
  dateFormat: 'YYYY-MM-DD',

  // Environment-based configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  apiTimeout: 30000,
  dashboardRefreshInterval: 60000,
  logRefreshInterval: 30000,
  tokenRefreshThreshold: 300,
  pageSize: 20
}
