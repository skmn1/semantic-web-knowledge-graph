import React, { useState, useEffect } from 'react';
import umaAccessControl from '../services/umaAccessControl';
import { format } from 'date-fns';

function AccessRequests({ currentUser }) {
  const [myRequests, setMyRequests] = useState([]);
  const [myPermissions, setMyPermissions] = useState([]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    // Get requests made by current user
    const requests = umaAccessControl.getRequestsByUser(currentUser.id);
    setMyRequests(requests);

    // Get permissions granted to current user
    const permissions = umaAccessControl.getPermissionsForUser(currentUser.id);
    setMyPermissions(permissions);
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') return <span className="badge badge-warning">⏳ Pending</span>;
    if (status === 'approved') return <span className="badge badge-success">✓ Approved</span>;
    if (status === 'denied') return <span className="badge badge-danger">✗ Denied</span>;
    return <span className="badge badge-secondary">{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Access Requests</h1>
        <p className="page-description">
          View your access requests and permissions you've been granted.
        </p>
      </div>

      <div className="info-panel">
        <div className="info-panel-title">ℹ️ UMA Request Workflow</div>
        <div className="info-panel-content">
          When you need access to a photo you don't own, you submit an <strong>access request</strong> to the resource owner. 
          They can approve or deny your request. If approved, you'll receive a <strong>permission</strong> that grants 
          you specific actions (like display or use) for a limited time. This demonstrates the UMA authorization flow 
          where users control their own resources.
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">📤 My Requests ({myRequests.length})</h3>
        {myRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <div className="empty-state-title">No Requests</div>
            <p>You haven't requested access to any photos yet. Browse photos and click "Request Access" on restricted resources.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Owner</th>
                  <th>Purpose</th>
                  <th>Message</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((request) => {
                  const owner = umaAccessControl.getUser(request.ownerId);
                  return (
                    <tr key={request.id}>
                      <td><span className="badge badge-secondary">{request.resourceId}</span></td>
                      <td>{owner?.name || request.ownerId}</td>
                      <td><span className="badge badge-info">{request.purpose}</span></td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.message || 'No message'}
                      </td>
                      <td>{format(new Date(request.timestamp), 'MMM dd, yyyy HH:mm')}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        {request.status === 'approved' && request.approvedAt && 
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {format(new Date(request.approvedAt), 'MMM dd, yyyy')}
                          </span>
                        }
                        {request.status === 'denied' && request.deniedAt && 
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {format(new Date(request.deniedAt), 'MMM dd, yyyy')}
                            {request.denialReason && <div>Reason: {request.denialReason}</div>}
                          </span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-header">✅ My Permissions ({myPermissions.length})</h3>
        {myPermissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No Permissions</div>
            <p>You don't have any granted permissions yet. Request access to photos to get started.</p>
          </div>
        ) : (
          <>
            <div className="alert alert-info">
              <strong>Active Permissions:</strong> You have {myPermissions.length} active permission(s) to access resources 
              owned by others. These permissions allow you to perform specific actions as defined by ODRL policies.
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Owner</th>
                    <th>Allowed Actions</th>
                    <th>Conditions</th>
                    <th>Granted</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myPermissions.map((permission) => {
                    const owner = umaAccessControl.getResourceOwner(permission.resourceId);
                    const ownerUser = umaAccessControl.getUser(owner);
                    const daysUntilExpiry = Math.ceil(
                      (new Date(permission.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <tr key={permission.id}>
                        <td><span className="badge badge-secondary">{permission.resourceId}</span></td>
                        <td>{ownerUser?.name || owner}</td>
                        <td>
                          {permission.actions.map(action => (
                            <span key={action} className="badge badge-success" style={{ marginRight: '0.25rem' }}>
                              {action}
                            </span>
                          ))}
                        </td>
                        <td style={{ fontSize: '0.875rem' }}>
                          {permission.conditions?.purpose && (
                            <div>Purpose: <span className="badge badge-info">{permission.conditions.purpose}</span></div>
                          )}
                          {permission.conditions?.attribution && (
                            <div><span className="badge badge-warning">Attribution Required</span></div>
                          )}
                        </td>
                        <td>{format(new Date(permission.grantedAt), 'MMM dd, yyyy')}</td>
                        <td>
                          {format(new Date(permission.expiresAt), 'MMM dd, yyyy')}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ({daysUntilExpiry} days)
                          </div>
                        </td>
                        <td>
                          {daysUntilExpiry > 30 ? (
                            <span className="badge badge-success">Active</span>
                          ) : daysUntilExpiry > 0 ? (
                            <span className="badge badge-warning">Expiring Soon</span>
                          ) : (
                            <span className="badge badge-danger">Expired</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3 className="card-header">💡 How Access Control Works</h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            This system implements <strong>User-Managed Access (UMA)</strong>, a profile of OAuth 2.0 that enables 
            resource owners to control access to their protected resources.
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>The UMA Flow:</strong>
            <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>You discover a photo you want to access</li>
              <li>You submit an access request explaining your purpose</li>
              <li>The resource owner receives and reviews your request</li>
              <li>Owner approves/denies based on their policies (ODRL)</li>
              <li>If approved, you receive a time-limited permission</li>
              <li>The system enforces these permissions automatically</li>
              <li>All access is logged for transparency</li>
            </ol>
          </div>

          <div>
            <strong>Integration with ODRL:</strong>
            <p style={{ marginTop: '0.5rem' }}>
              While UMA manages <em>who</em> can access resources, ODRL policies define <em>what</em> they can do 
              and under what conditions. For example, even with UMA permission, ODRL policies might prohibit 
              commercial use or require attribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessRequests;
