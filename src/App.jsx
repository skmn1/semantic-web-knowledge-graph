import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import BrowsePhotos from './pages/BrowsePhotos';
import SPARQLPlayground from './pages/SPARQLPlayground';
import MyResources from './pages/MyResources';
import AccessRequests from './pages/AccessRequests';
import PolicyViewer from './pages/PolicyViewer';
import AuditLog from './pages/AuditLog';
import { users } from './services/umaAccessControl';

function Navbar({ currentUser, onSwitchUser }) {
  const location = useLocation();

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
          <button className="btn-switch-user" onClick={onSwitchUser}>
            Switch User
          </button>
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

  const currentUser = users[currentUserId];

  const handleSwitchUser = () => {
    setShowUserSwitcher(true);
  };

  const handleSelectUser = (userId) => {
    setCurrentUserId(userId);
    setShowUserSwitcher(false);
  };

  return (
    <Router>
      <div className="app">
        <Navbar currentUser={currentUser} onSwitchUser={handleSwitchUser} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<BrowsePhotos currentUser={currentUser} />} />
            <Route path="/sparql" element={<SPARQLPlayground currentUser={currentUser} />} />
            <Route path="/my-resources" element={<MyResources currentUser={currentUser} />} />
            <Route path="/access-requests" element={<AccessRequests currentUser={currentUser} />} />
            <Route path="/policies" element={<PolicyViewer currentUser={currentUser} />} />
            <Route path="/audit-log" element={<AuditLog currentUser={currentUser} />} />
          </Routes>
        </main>

        {showUserSwitcher && (
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
