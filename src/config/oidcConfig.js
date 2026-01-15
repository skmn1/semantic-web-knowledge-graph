/**
 * OIDC Configuration
 * 
 * Configures OpenID Connect authentication for the application.
 * Settings are loaded from environment variables for security and flexibility.
 */

export const oidcConfig = {
  // OIDC Provider URL (e.g., https://your-auth0-domain.auth0.com)
  authority: import.meta.env.VITE_OIDC_AUTHORITY || '',
  
  // Client ID from your OIDC provider
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || '',
  
  // Redirect URI after successful authentication
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI || window.location.origin + '/callback',
  
  // Redirect URI after logout
  post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || window.location.origin,
  
  // OAuth scopes to request
  scope: import.meta.env.VITE_OIDC_SCOPE || 'openid profile email',
  
  // Response type (code for authorization code flow)
  response_type: import.meta.env.VITE_OIDC_RESPONSE_TYPE || 'code',
  
  // Automatically sign in when user is not authenticated
  automaticSilentRenew: true,
  
  // Load user info from the user info endpoint
  loadUserInfo: true,
  
  // Metadata settings
  metadata: {
    // These will be auto-discovered from the authority/.well-known/openid-configuration
    // but can be overridden if needed
  },
  
  // In-memory storage (required since localStorage is not available)
  userStore: undefined, // Will be set to custom in-memory store
  stateStore: undefined, // Will be set to custom in-memory store
};

/**
 * Validates OIDC configuration
 * @returns {boolean} True if configuration is valid
 */
export function validateOidcConfig() {
  if (!oidcConfig.authority) {
    console.error('OIDC Authority is not configured. Please set VITE_OIDC_AUTHORITY in .env file');
    return false;
  }
  
  if (!oidcConfig.client_id) {
    console.error('OIDC Client ID is not configured. Please set VITE_OIDC_CLIENT_ID in .env file');
    return false;
  }
  
  return true;
}

/**
 * Check if OIDC is properly configured
 * @returns {boolean}
 */
export function isOidcConfigured() {
  return !!(oidcConfig.authority && oidcConfig.client_id);
}
