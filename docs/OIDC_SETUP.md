# OIDC Authentication Setup Guide

This guide will help you configure OpenID Connect (OIDC) authentication for the Semantic Web Knowledge Graph application.

## Overview

The application supports two authentication modes:
- **Demo Mode**: Uses mock users (default when OIDC is not configured)
- **OIDC Mode**: Real authentication with any OIDC-compliant provider

## Quick Start

### 1. Choose Your OIDC Provider

Select one of these popular OIDC providers:

- **Auth0** - https://auth0.com (Recommended for quick setup)
- **Keycloak** - https://www.keycloak.org (Self-hosted option)
- **Google Identity** - https://developers.google.com/identity
- **Azure AD** - https://azure.microsoft.com/en-us/services/active-directory/
- **Okta** - https://www.okta.com

### 2. Register Your Application

Each provider has slightly different steps, but generally you need to:

1. Create an account with your chosen provider
2. Create a new application/client
3. Configure redirect URIs:
   - **Redirect URI**: `http://localhost:3000/callback`
   - **Post Logout Redirect URI**: `http://localhost:3000`
4. Get your credentials:
   - Authority URL (or Issuer URL)
   - Client ID
   - (Client Secret is NOT needed for public SPA clients)

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your OIDC configuration:
   ```env
   VITE_OIDC_AUTHORITY=https://your-provider.com
   VITE_OIDC_CLIENT_ID=your-client-id
   VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
   VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
   VITE_OIDC_SCOPE=openid profile email
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## Provider-Specific Setup

### Auth0

1. **Create Auth0 Application**
   - Go to https://manage.auth0.com
   - Create Account → Applications → Create Application
   - Choose "Single Page Web Applications"
   - Select "React" as the technology

2. **Configure Application**
   - **Allowed Callback URLs**: `http://localhost:3000/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

3. **Environment Configuration**
   ```env
   VITE_OIDC_AUTHORITY=https://YOUR_DOMAIN.auth0.com
   VITE_OIDC_CLIENT_ID=YOUR_CLIENT_ID
   VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
   VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
   VITE_OIDC_SCOPE=openid profile email
   ```

### Keycloak

1. **Install Keycloak** (if self-hosting)
   ```bash
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

2. **Create Realm and Client**
   - Access Keycloak Admin Console: http://localhost:8080
   - Create a new realm (e.g., "research")
   - Create a new client:
     - Client ID: `semantic-web-app`
     - Client Protocol: `openid-connect`
     - Access Type: `public`
     - Valid Redirect URIs: `http://localhost:3000/callback`
     - Web Origins: `http://localhost:3000`

3. **Environment Configuration**
   ```env
   VITE_OIDC_AUTHORITY=http://localhost:8080/realms/research
   VITE_OIDC_CLIENT_ID=semantic-web-app
   VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
   VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
   VITE_OIDC_SCOPE=openid profile email
   ```

### Google Identity

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable Google Identity Platform

2. **Create OAuth 2.0 Credentials**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/callback`

3. **Environment Configuration**
   ```env
   VITE_OIDC_AUTHORITY=https://accounts.google.com
   VITE_OIDC_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
   VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
   VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
   VITE_OIDC_SCOPE=openid profile email
   ```

### Azure AD

1. **Register Application in Azure Portal**
   - Go to https://portal.azure.com
   - Azure Active Directory → App registrations → New registration
   - Redirect URI: `http://localhost:3000/callback` (Single-page application)

2. **Configure Authentication**
   - Authentication → Platform configurations → Add a platform → Single-page application
   - Redirect URIs: `http://localhost:3000/callback`
   - Logout URL: `http://localhost:3000`

3. **Environment Configuration**
   ```env
   VITE_OIDC_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0
   VITE_OIDC_CLIENT_ID=YOUR_CLIENT_ID
   VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
   VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
   VITE_OIDC_SCOPE=openid profile email
   ```

## Production Deployment

When deploying to production, update the redirect URIs:

1. **Update Provider Configuration**
   - Add production URLs to allowed redirect URIs
   - Example: `https://your-domain.com/callback`

2. **Update Environment Variables**
   ```env
   VITE_OIDC_REDIRECT_URI=https://your-domain.com/callback
   VITE_OIDC_POST_LOGOUT_REDIRECT_URI=https://your-domain.com
   ```

3. **Security Considerations**
   - Use HTTPS in production (required by OIDC spec)
   - Keep Client ID public but never expose Client Secret
   - Regularly rotate credentials
   - Monitor authentication logs
   - Implement rate limiting on authentication endpoints

## Troubleshooting

### "OIDC is not configured" Message

**Problem**: Demo mode banner appears even after configuration.

**Solution**:
1. Verify `.env` file exists in project root
2. Check that variables start with `VITE_` prefix
3. Restart development server after changing `.env`
4. Clear browser cache

### "Invalid Redirect URI" Error

**Problem**: Provider rejects redirect.

**Solution**:
1. Verify redirect URI in provider matches exactly (including protocol, port)
2. Check for trailing slashes
3. Ensure redirect URI is registered as "Single Page Application" type

### "CORS Error" During Authentication

**Problem**: Browser blocks authentication request.

**Solution**:
1. Add `http://localhost:3000` to allowed origins in provider
2. Check provider's CORS configuration
3. Verify you're using correct authority URL

### Authentication Succeeds but Session Lost on Refresh

**Problem**: User is logged out on page refresh.

**Solution**: 
This is expected behavior with in-memory storage. The session is intentionally volatile because localStorage/sessionStorage are not available in the artifact environment. For production use:
- Implement backend session management
- Use HTTP-only cookies
- Consider implementing silent token refresh with iframe

### User Information Not Displaying

**Problem**: User is authenticated but name/email don't appear.

**Solution**:
1. Check that OIDC scopes include `profile` and `email`
2. Verify provider is configured to include these claims
3. Check browser console for errors
4. Inspect `user.profile` object in session manager

## Advanced Configuration

### Custom Scopes

Request additional scopes beyond the defaults:

```env
VITE_OIDC_SCOPE=openid profile email offline_access custom_scope
```

### Silent Token Refresh

The application automatically attempts silent token refresh. To disable:

Edit `src/config/oidcConfig.js`:
```javascript
automaticSilentRenew: false,
```

### Custom Claims

Access custom claims from your ID token:

```javascript
import { sessionManager } from './services/sessionManager';

const claims = sessionManager.getUserClaims();
console.log(claims.custom_claim);
```

## Testing

### Test with Multiple Users

1. Use incognito/private browsing windows
2. Sign in with different accounts
3. Verify access control works correctly

### Test Access Control Flow

1. Sign in as User A
2. Request access to User B's resource
3. Sign out and sign in as User B
4. Approve the access request
5. Sign in as User A again
6. Verify access is granted

## Support

For issues or questions:
1. Check application logs in browser console
2. Review provider documentation
3. Verify OIDC configuration at `/.well-known/openid-configuration`
4. Check network tab in browser DevTools for failed requests

## Demo Mode vs OIDC Mode

| Feature | Demo Mode | OIDC Mode |
|---------|-----------|-----------|
| Authentication | Mock users | Real OIDC provider |
| User switching | Button in UI | Sign out/in |
| Session persistence | Lost on refresh | Lost on refresh* |
| Production ready | No | Yes |
| Setup required | None | Provider configuration |

\* With in-memory storage. Use backend sessions for production.

## Next Steps

After configuring OIDC:
1. Test the authentication flow
2. Verify user information is displayed correctly
3. Test access control features
4. Configure production environment
5. Implement additional security measures as needed
