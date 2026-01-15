/**
 * In-Memory Session Manager
 * 
 * Provides in-memory storage for OIDC session data.
 * This is required because localStorage/sessionStorage are not available in artifacts.
 * 
 * WARNING: Data is lost on page refresh. In production, consider implementing
 * a more robust solution (backend session management, cookies, etc.)
 */

class InMemoryStore {
  constructor() {
    this.store = new Map();
  }

  async set(key, value) {
    this.store.set(key, value);
  }

  async get(key) {
    return this.store.get(key);
  }

  async remove(key) {
    this.store.delete(key);
  }

  async getAllKeys() {
    return Array.from(this.store.keys());
  }

  clear() {
    this.store.clear();
  }
}

// Singleton instances for state and user storage
export const inMemoryStateStore = new InMemoryStore();
export const inMemoryUserStore = new InMemoryStore();

/**
 * Session Manager
 * Manages user session data and provides utilities for session handling
 */
class SessionManager {
  constructor() {
    this.currentUser = null;
    this.accessToken = null;
    this.idToken = null;
    this.sessionListeners = new Set();
  }

  /**
   * Set current user session
   * @param {Object} user - User object from OIDC
   * @param {string} accessToken - Access token
   * @param {string} idToken - ID token
   */
  setSession(user, accessToken, idToken) {
    this.currentUser = user;
    this.accessToken = accessToken;
    this.idToken = idToken;
    this.notifyListeners();
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.currentUser = null;
    this.accessToken = null;
    this.idToken = null;
    inMemoryStateStore.clear();
    inMemoryUserStore.clear();
    this.notifyListeners();
  }

  /**
   * Get current user
   * @returns {Object|null}
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Get access token
   * @returns {string|null}
   */
  getAccessToken() {
    return this.accessToken;
  }

  /**
   * Get ID token
   * @returns {string|null}
   */
  getIdToken() {
    return this.idToken;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.currentUser && !!this.accessToken;
  }

  /**
   * Get user ID
   * @returns {string|null}
   */
  getUserId() {
    return this.currentUser?.profile?.sub || null;
  }

  /**
   * Get user email
   * @returns {string|null}
   */
  getUserEmail() {
    return this.currentUser?.profile?.email || null;
  }

  /**
   * Get user name
   * @returns {string|null}
   */
  getUserName() {
    return this.currentUser?.profile?.name || 
           this.currentUser?.profile?.preferred_username || 
           this.currentUser?.profile?.email?.split('@')[0] || 
           'User';
  }

  /**
   * Add session change listener
   * @param {Function} listener - Callback function
   */
  addListener(listener) {
    this.sessionListeners.add(listener);
  }

  /**
   * Remove session change listener
   * @param {Function} listener - Callback function
   */
  removeListener(listener) {
    this.sessionListeners.delete(listener);
  }

  /**
   * Notify all listeners of session change
   */
  notifyListeners() {
    this.sessionListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  /**
   * Get user claims from ID token
   * @returns {Object}
   */
  getUserClaims() {
    return this.currentUser?.profile || {};
  }

  /**
   * Check if token is expired
   * @returns {boolean}
   */
  isTokenExpired() {
    if (!this.currentUser?.expires_at) {
      return true;
    }
    return Date.now() / 1000 >= this.currentUser.expires_at;
  }

  /**
   * Get time until token expires (in seconds)
   * @returns {number}
   */
  getTimeUntilExpiry() {
    if (!this.currentUser?.expires_at) {
      return 0;
    }
    return Math.max(0, this.currentUser.expires_at - Date.now() / 1000);
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

export default sessionManager;
