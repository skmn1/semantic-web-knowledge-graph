# OIDC Security Best Practices

## Overview

This document outlines security considerations and best practices for the OIDC authentication implementation.

## Security Architecture

### In-Memory Session Storage

**Design Decision**: The application uses in-memory storage instead of localStorage/sessionStorage.

**Rationale**:
- Prevents XSS attacks from stealing tokens
- Tokens are not persisted across browser sessions
- Reduces attack surface for token theft
- Complies with artifact environment constraints

**Trade-offs**:
- Sessions don't survive page refresh
- Users must re-authenticate after refresh
- No offline access to tokens

**Production Recommendation**: 
For production deployments, consider:
- Backend session management with HTTP-only cookies
- Token refresh with sliding window expiration
- Silent authentication flows for better UX

### Authorization Code Flow

The application uses the **Authorization Code Flow** (with PKCE where supported):

1. User clicks "Sign In"
2. Redirected to OIDC provider
3. User authenticates at provider
4. Provider redirects back with authorization code
5. Application exchanges code for tokens
6. Tokens stored in memory only

**Why this flow?**
- Most secure for public clients (SPAs)
- Tokens never exposed in browser history
- PKCE prevents authorization code interception
- Recommended by OAuth 2.0 Security BCP

### Token Handling

**Access Tokens**:
- Stored in memory only
- Not persisted to any storage
- Automatically included in API requests (when implemented)
- Short-lived (follow provider's expiration)

**ID Tokens**:
- Used for user identity information
- Stored in memory only
- Contains user claims (name, email, etc.)
- Validated by OIDC library

**Refresh Tokens**:
- Not currently used (in-memory storage limitation)
- Can be enabled with `offline_access` scope
- Would require secure storage mechanism

## Security Configuration

### HTTPS Requirement

**Development**: HTTP is acceptable for localhost
**Production**: HTTPS is **required**

OIDC specification mandates HTTPS for:
- Token endpoints
- Authorization endpoints
- Redirect URIs (except localhost)

### CORS Configuration

Ensure your OIDC provider allows:
```
Access-Control-Allow-Origin: http://localhost:3000
```

For production:
```
Access-Control-Allow-Origin: https://your-domain.com
```

**Never use**:
```
Access-Control-Allow-Origin: *
```

### Redirect URI Validation

**Critical**: Providers must validate redirect URIs exactly.

**Bad**:
- Wildcard redirect URIs
- Open redirects
- Unregistered URIs

**Good**:
- Exact match required
- Registered in provider configuration
- HTTPS in production

## Preventing Common Attacks

### XSS (Cross-Site Scripting)

**Protection Measures**:
1. React automatically escapes user input
2. No use of `dangerouslySetInnerHTML`
3. Tokens not stored in localStorage
4. Content Security Policy headers (add in production)

**Recommendation**:
Add CSP headers to production deployment:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://your-oidc-provider.com
```

### CSRF (Cross-Site Request Forgery)

**Protection Measures**:
1. OIDC state parameter (automatically handled)
2. SameSite cookie attribute (if using cookies)
3. Token-based authentication (not session-based)

The OIDC library automatically includes state parameter to prevent CSRF attacks.

### Token Theft

**Protection Measures**:
1. In-memory storage (not localStorage)
2. Short-lived access tokens
3. Automatic token refresh (when configured)
4. HTTPS in production

**If token is compromised**:
- User can revoke session at OIDC provider
- Tokens expire automatically
- No long-term persistence of stolen tokens

### Authorization Code Interception

**Protection Measures**:
1. PKCE (Proof Key for Code Exchange) enabled
2. State parameter validation
3. Redirect URI exact match
4. One-time use of authorization codes

### Man-in-the-Middle (MITM)

**Protection Measures**:
1. HTTPS required in production
2. Certificate validation
3. No insecure connections
4. HSTS headers in production

## Access Control Security

### Resource Authorization

The UMA (User-Managed Access) implementation:
- Resource owner controls access
- Fine-grained permissions
- Audit trail of access requests
- Time-limited permissions

### Policy Evaluation

ODRL policies are evaluated:
- Before every resource access
- With multiple constraint types
- Logging all decisions
- Denying by default

## User Privacy

### Data Collection

**What we collect**:
- User ID (sub claim from OIDC)
- Name and email (if in scope)
- Access request history
- Query audit logs

**What we don't collect**:
- Passwords (handled by OIDC provider)
- Payment information
- Tracking cookies
- Personal browsing history

### Data Retention

**In-Memory Data**:
- Cleared on browser close
- Cleared on logout
- Not persisted to disk
- Not transmitted to third parties

**Audit Logs**:
- Stored in memory only
- Used for transparency
- Can be exported (future feature)
- Cleared on application reload

### GDPR Compliance

For EU users, ensure:
1. Clear privacy policy
2. User consent for data processing
3. Right to access data
4. Right to erasure (logout clears data)
5. Data portability (export features)

## Production Deployment Checklist

### Before Going Live

- [ ] HTTPS enabled on all endpoints
- [ ] Redirect URIs use HTTPS
- [ ] OIDC provider configured for production domain
- [ ] Environment variables secured (not in source control)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Error messages don't leak sensitive information
- [ ] Logging configured (but not logging tokens)
- [ ] Rate limiting on authentication endpoints
- [ ] Monitoring and alerting set up
- [ ] Security audit completed
- [ ] Penetration testing performed
- [ ] Backup authentication mechanism (if needed)

### Security Headers

Add these headers in production:

```nginx
# Nginx example
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; connect-src 'self' https://your-oidc-provider.com" always;
```

### Environment Security

**Development**:
```env
# .env (not committed to git)
VITE_OIDC_AUTHORITY=http://localhost:8080/realms/dev
VITE_OIDC_CLIENT_ID=dev-client-id
```

**Production**:
```env
# Set in hosting platform (Vercel, Netlify, etc.)
VITE_OIDC_AUTHORITY=https://auth.your-domain.com
VITE_OIDC_CLIENT_ID=prod-client-id
```

**Never commit**:
- `.env` files
- Client secrets
- API keys
- Tokens

### Monitoring

Monitor for:
- Failed authentication attempts
- Unusual access patterns
- Token validation failures
- Authorization errors
- Rate limit violations

**Tools**:
- Provider's authentication logs
- Application error logs
- Browser console errors (development)
- APM tools (production)

## Incident Response

### If Security Breach Suspected

1. **Immediately**:
   - Revoke all active sessions at OIDC provider
   - Rotate client credentials
   - Review access logs

2. **Investigation**:
   - Identify affected users
   - Determine breach scope
   - Document timeline

3. **Remediation**:
   - Patch vulnerabilities
   - Update dependencies
   - Improve security measures

4. **Communication**:
   - Notify affected users
   - Report to authorities (if required)
   - Update security documentation

### Emergency Contacts

Maintain list of:
- OIDC provider support
- Security team contacts
- Legal counsel
- Hosting provider support

## Compliance Considerations

### HIPAA (Healthcare)

If handling health data:
- Sign BAA with OIDC provider
- Encrypt data in transit and at rest
- Implement access logging
- Regular security audits

### GDPR (EU Privacy)

- Privacy policy clearly visible
- User consent before data collection
- Data minimization
- Right to erasure
- Data breach notification (72 hours)

### SOC 2 (Service Organizations)

- Access controls documented
- Change management procedures
- Incident response plan
- Regular security assessments

## Regular Maintenance

### Weekly
- Review authentication logs
- Check for failed login attempts
- Monitor error rates

### Monthly
- Update dependencies
- Review security advisories
- Test disaster recovery
- Verify backup systems

### Quarterly
- Security assessment
- Penetration testing
- Compliance review
- Documentation updates

### Annually
- Full security audit
- Credential rotation
- Architecture review
- Training and awareness

## Resources

### OIDC Security

- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OIDC Core Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)

### Security Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Snyk](https://snyk.io/) - Dependency scanning
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Security audit

### Further Reading

- OWASP Top 10
- NIST Cybersecurity Framework
- CIS Controls
- PCI DSS (if handling payments)

## Support

For security concerns:
1. Review this document
2. Check OIDC provider security documentation
3. Consult security professionals
4. Report vulnerabilities responsibly
