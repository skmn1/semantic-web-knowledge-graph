import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import BrowsePhotos from './pages/BrowsePhotos';
import SPARQLPlayground from './pages/SPARQLPlayground';
import MyResources from './pages/MyResources';
import AccessRequests from './pages/AccessRequests';
import PolicyViewer from './pages/PolicyViewer';
import AuditLog from './pages/AuditLog';
import CallbackPage from './pages/CallbackPage';
import { users } from './services/umaAccessControl';
import { OidcProvider, useAuth, LoginButton, LogoutButton } from './components/OidcProvider';
import { isOidcConfigured } from './config/oidcConfig';
import { sessionManager } from './services/sessionManager';

function Navbar({ currentUser, onSwitchUser, onLogout, isOidcMode }) {
  const location = useLocation();
  const auth = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🔬 Knowledge Graph
          <span>Semantic Web Research Platform</span>
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Browse Photos
            </Link>
          </li>
          <li>
            <Link to="/sparql" className={`nav-link ${isActive('/sparql') ? 'active' : ''}`}>
              SPARQL Query
            </Link>
          </li>
          <li>
            <Link to="/my-resources" className={`nav-link ${isActive('/my-resources') ? 'active' : ''}`}>
              My Resources
            </Link>
          </li>
          <li>
            <Link to="/access-requests" className={`nav-link ${isActive('/access-requests') ? 'active' : ''}`}>
              Access Requests
            </Link>
          </li>
          <li>
            <Link to="/policies" className={`nav-link ${isActive('/policies') ? 'active' : ''}`}>
              Policies
            </Link>
          </li>
          <li>
            <Link to="/audit-log" className={`nav-link ${isActive('/audit-log') ? 'active' : ''}`}>
              Audit Log
            </Link>
          </li>
        </ul>

        <div className="user-info">
          <div className="user-badge">
            👤 {currentUser.name}
          </div>
          {isOidcMode ? (
            <LogoutButton className="btn-switch-user">
              Sign Out
            </LogoutButton>
          ) : (
            <button className="btn-switch-user" onClick={onSwitchUser}>
              Switch User
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function UserSwitcher({ onSelectUser, currentUserId }) {
  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') {
        onSelectUser(currentUserId);
      }
    }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Switch User</h2>
          <button className="modal-close" onClick={() => onSelectUser(currentUserId)}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Select a user to simulate different perspectives in the system:
          </p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.values(users).map(user => (
              <button
                key={user.id}
                className={`btn ${user.id === currentUserId ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => onSelectUser(user.id)}
                style={{ justifyContent: 'flex-start', padding: '1rem' }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {user.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentUserId, setCurrentUserId] = useState('alice');
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [currentUser, setCurrentUser] = useState(users['alice']);
  const auth = useAuth();

  // Determine if we're using OIDC or demo mode
  const isOidcMode = isOidcConfigured() && auth?.isAuthenticated;

  // Update current user based on authentication mode
  useEffect(() => {
    if (isOidcMode && auth.user) {
      // Use OIDC authenticated user
      const oidcUser = {
        id: sessionManager.getUserId() || 'oidc-user',
        name: sessionManager.getUserName() || 'User',
        email: sessionManager.getUserEmail() || 'user@example.com',
        profile: sessionManager.getUserClaims()
      };
      setCurrentUser(oidcUser);
    } else {
      // Use demo mode user
      setCurrentUser(users[currentUserId]);
    }
  }, [isOidcMode, auth?.user, currentUserId]);

  const handleSwitchUser = () => {
    setShowUserSwitcher(true);
  };

  const handleSelectUser = (userId) => {
    setCurrentUserId(userId);
    setShowUserSwitcher(false);
  };

  // Show loading state while authentication is being determined
  if (isOidcConfigured() && auth?.isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>⟳</div>
        <div>Loading authentication...</div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show login screen if OIDC is configured but user is not authenticated
  if (isOidcConfigured() && !auth?.isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#333' }}>
            🔬 Knowledge Graph
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Semantic Web Research Platform
          </p>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Sign in to access the secure knowledge graph federation system with RDF, OWL, SPARQL, ODRL, and UMA.
          </p>
          <LoginButton className="btn btn-primary" style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            background: '#667eea',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            width: '100%'
          }}>
            🔐 Sign In with OIDC
          </LoginButton>
          {auth?.error && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8d7da',
              border: '1px solid #dc3545',
              borderRadius: '6px',
              color: '#721c24'
            }}>
              <strong>Error:</strong> {auth.error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar 
          currentUser={currentUser} 
          onSwitchUser={handleSwitchUser}
          isOidcMode={isOidcMode}
        />
        
        <main className="main-content">
          {/* Show demo mode banner if not using OIDC */}
          {!isOidcConfigured() && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <strong>Demo Mode:</strong> OIDC authentication is not configured. 
                Using mock users for demonstration. 
                Configure OIDC in <code>.env</code> file for production use.
              </div>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<BrowsePhotos currentUser={currentUser} />} />
            <Route path="/sparql" element={<SPARQLPlayground currentUser={currentUser} />} />
            <Route path="/my-resources" element={<MyResources currentUser={currentUser} />} />
            <Route path="/access-requests" element={<AccessRequests currentUser={currentUser} />} />
            <Route path="/policies" element={<PolicyViewer currentUser={currentUser} />} />
            <Route path="/audit-log" element={<AuditLog currentUser={currentUser} />} />
            <Route path="/callback" element={<CallbackPage />} />
          </Routes>
        </main>

        {showUserSwitcher && !isOidcMode && (
          <UserSwitcher 
            onSelectUser={handleSelectUser} 
            currentUserId={currentUserId}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
