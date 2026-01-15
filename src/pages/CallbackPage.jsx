/**
 * OIDC Callback Page
 * 
 * Handles the redirect callback from the OIDC provider after authentication.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../components/OidcProvider';
import { useNavigate } from 'react-router-dom';

export default function CallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (auth.isAuthenticated) {
      navigate('/');
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.error) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '4rem auto', 
        padding: '2rem',
        textAlign: 'center' 
      }}>
        <div style={{ 
          background: '#f8d7da', 
          border: '1px solid #dc3545', 
          borderRadius: '8px',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#721c24', marginBottom: '1rem' }}>
            Authentication Error
          </h2>
          <p style={{ color: '#721c24', marginBottom: '1.5rem' }}>
            {auth.error.message}
          </p>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '4rem auto', 
      padding: '2rem',
      textAlign: 'center' 
    }}>
      <div style={{ 
        background: '#e7f3ff', 
        border: '1px solid #0066cc', 
        borderRadius: '8px',
        padding: '2rem'
      }}>
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          animation: 'spin 1s linear infinite'
        }}>
          ⟳
        </div>
        <h2 style={{ color: '#004085', marginBottom: '0.5rem' }}>
          Completing Sign In...
        </h2>
        <p style={{ color: '#004085' }}>
          Please wait while we complete your authentication.
        </p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
