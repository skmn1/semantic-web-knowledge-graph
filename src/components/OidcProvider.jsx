/**
 * OIDC Authentication Provider
 * 
 * Provides OIDC authentication context to the application.
 * Wraps react-oidc-context with custom configuration and in-memory storage.
 */

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { oidcConfig, isOidcConfigured } from '../config/oidcConfig';
import { sessionManager, inMemoryStateStore, inMemoryUserStore } from '../services/sessionManager';

/**
 * Custom WebStorage adapter for in-memory storage
 */
class InMemoryWebStorage {
  constructor(store) {
    this.store = store;
  }

  get length() {
    return this.store.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key) {
    const value = this.store.store.get(key);
    return value !== undefined ? value : null;
  }

  key(index) {
    const keys = Array.from(this.store.store.keys());
    return keys[index] || null;
  }

  removeItem(key) {
    this.store.store.delete(key);
  }

  setItem(key, value) {
    this.store.store.set(key, value);
  }
}

/**
 * Session Sync Component
 * Syncs OIDC auth state with session manager
 */
function SessionSync() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      sessionManager.setSession(
        auth.user,
        auth.user.access_token,
        auth.user.id_token
      );
    } else {
      sessionManager.clearSession();
    }
  }, [auth.isAuthenticated, auth.user]);

  return null;
}

/**
 * OIDC Provider Component
 */
export function OidcProvider({ children }) {
  // If OIDC is not configured, render children without authentication
  if (!isOidcConfigured()) {
    console.warn('OIDC is not configured. Running in demo mode without authentication.');
    return <>{children}</>;
  }

  // Configure in-memory storage
  const config = {
    ...oidcConfig,
    userStore: new WebStorageStateStore({ 
      store: new InMemoryWebStorage(inMemoryUserStore) 
    }),
    stateStore: new WebStorageStateStore({ 
      store: new InMemoryWebStorage(inMemoryStateStore) 
    }),
  };

  const onSigninCallback = () => {
    // Navigate to the page user was on before signin
    const returnUrl = sessionStorage.getItem('returnUrl') || '/';
    window.history.replaceState({}, document.title, returnUrl);
  };

  return (
    <AuthProvider
      {...config}
      onSigninCallback={onSigninCallback}
      onRemoveUser={() => sessionManager.clearSession()}
    >
      <SessionSync />
      {children}
    </AuthProvider>
  );
}

/**
 * Login Button Component
 */
export function LoginButton({ className = '', children = 'Sign In' }) {
  const auth = useAuth();

  if (!isOidcConfigured()) {
    return null;
  }

  const handleLogin = () => {
    auth.signinRedirect();
  };

  return (
    <button onClick={handleLogin} className={className}>
      {children}
    </button>
  );
}

/**
 * Logout Button Component
 */
export function LogoutButton({ className = '', children = 'Sign Out' }) {
  const auth = useAuth();

  if (!isOidcConfigured()) {
    return null;
  }

  const handleLogout = () => {
    auth.signoutRedirect();
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}

/**
 * Authentication Status Component
 */
export function AuthStatus() {
  const auth = useAuth();

  if (!isOidcConfigured()) {
    return (
      <div style={{ padding: '1rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', margin: '1rem 0' }}>
        <strong>⚠️ Demo Mode:</strong> OIDC authentication is not configured. 
        Please configure your OIDC provider in the .env file to enable real authentication.
      </div>
    );
  }

  if (auth.isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (auth.error) {
    return (
      <div style={{ padding: '1rem', background: '#f8d7da', border: '1px solid #dc3545', borderRadius: '4px', margin: '1rem 0' }}>
        <strong>Authentication Error:</strong> {auth.error.message}
      </div>
    );
  }

  if (auth.isAuthenticated) {
    const userName = sessionManager.getUserName();
    const userEmail = sessionManager.getUserEmail();
    
    return (
      <div style={{ padding: '1rem', background: '#d4edda', border: '1px solid #28a745', borderRadius: '4px', margin: '1rem 0' }}>
        <strong>✓ Authenticated:</strong> {userName}
        {userEmail && <div style={{ fontSize: '0.9em', marginTop: '0.25rem' }}>{userEmail}</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', background: '#e2e3e5', border: '1px solid #6c757d', borderRadius: '4px', margin: '1rem 0' }}>
      Not authenticated. Please sign in.
    </div>
  );
}

/**
 * Protected Route Component
 */
export function ProtectedRoute({ children }) {
  const auth = useAuth();

  // If OIDC is not configured, allow access (demo mode)
  if (!isOidcConfigured()) {
    return <>{children}</>;
  }

  if (auth.isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Required</h2>
        <p>Please sign in to access this page.</p>
        <LoginButton className="btn btn-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

export { useAuth };
