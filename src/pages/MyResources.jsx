import React, { useState, useEffect } from 'react';
import umaAccessControl from '../services/umaAccessControl';
import odrlManager from '../services/odrlManager';
import sparqlEngine from '../services/sparqlEngine';
import queryLogger from '../services/queryLogger';
import { format } from 'date-fns';

function MyResources({ currentUser }) {
  const [myPhotos, setMyPhotos] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [grantedPermissions, setGrantedPermissions] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    // Get photos owned by current user
    const resourceIds = umaAccessControl.getResourcesByOwner(currentUser.id);
    
    // Query for photo details
    const photoDetails = resourceIds.map(photoId => {
      const query = `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>

SELECT ?title ?creator ?date
WHERE {
  ex:${photoId} dc:title ?title .
  ex:${photoId} dc:creator ?creator .
  OPTIONAL { ex:${photoId} dcterms:created ?date }
}`;
      
      const results = sparqlEngine.executeQuery(query);
      return {
        id: photoId,
        ...results.results[0]
      };
    });

    setMyPhotos(photoDetails);

    // Get access requests for my resources
    const requests = umaAccessControl.getRequestsForOwner(currentUser.id);
    setAccessRequests(requests);

    // Get permissions I've granted
    const permissions = umaAccessControl.getPermissionsByOwner(currentUser.id);
    setGrantedPermissions(permissions);

    // Get logs for my resources
    const allLogs = [];
    for (const photoId of resourceIds) {
      const photoLogs = queryLogger.getLogsForResource(photoId);
      allLogs.push(...photoLogs);
    }
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10));
  };

  const handleApproveRequest = (requestId) => {
    const result = umaAccessControl.approveRequest(requestId, ['display', 'use'], 365);
    if (result.success) {
      alert('Access request approved!');
      loadData();
    } else {
      alert(result.error);
    }
  };

  const handleDenyRequest = (requestId) => {
    const result = umaAccessControl.denyRequest(requestId, 'Access denied by owner');
    if (result.success) {
      alert('Access request denied.');
      loadData();
    } else {
      alert(result.error);
    }
  };

  const handleRevokePermission = (permissionId) => {
    if (confirm('Are you sure you want to revoke this permission?')) {
      const result = umaAccessControl.revokePermission(permissionId);
      if (result.success) {
        alert('Permission revoked successfully.');
        loadData();
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Resources</h1>
        <p className="page-description">
          Manage your photos, review access requests, and monitor usage of your resources.
        </p>
      </div>

      <div className="info-panel">
        <div className="info-panel-title">ℹ️ UMA Access Control</div>
        <div className="info-panel-content">
          This page demonstrates <strong>User-Managed Access (UMA)</strong> - you control who can access your resources. 
          Review and approve/deny access requests, grant permissions, and see who's using your photos. 
          All decisions are enforced by the system and logged for transparency.
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">📷 My Photos ({myPhotos.length})</h3>
        {myPhotos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📷</div>
            <div className="empty-state-title">No Photos</div>
            <p>You don't own any photos yet.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {myPhotos.map((photo) => {
              const policy = odrlManager.getPolicySummary(photo.id);
              return (
                <div key={photo.id} className="card">
                  <h4 style={{ marginBottom: '0.5rem' }}>{photo.title?.value || 'Untitled'}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    <div>📅 {photo.date?.value || 'Unknown date'}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="badge badge-info">{photo.id}</span>
                    </div>
                  </div>
                  {policy && (
                    <div style={{ fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Policy:</div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {policy.permissions.length} permission(s), {policy.prohibitions.length} prohibition(s)
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-header">📬 Access Requests ({accessRequests.filter(r => r.status === 'pending').length} pending)</h3>
        {accessRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📬</div>
            <div className="empty-state-title">No Access Requests</div>
            <p>No one has requested access to your resources yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Requester</th>
                  <th>Purpose</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessRequests.map((request) => {
                  const requester = umaAccessControl.getUser(request.requesterId);
                  return (
                    <tr key={request.id}>
                      <td><span className="badge badge-secondary">{request.resourceId}</span></td>
                      <td>{requester?.name || request.requesterId}</td>
                      <td><span className="badge badge-info">{request.purpose}</span></td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.message || 'No message'}
                      </td>
                      <td>{format(new Date(request.timestamp), 'MMM dd, yyyy')}</td>
                      <td>
                        {request.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                        {request.status === 'approved' && <span className="badge badge-success">Approved</span>}
                        {request.status === 'denied' && <span className="badge badge-danger">Denied</span>}
                      </td>
                      <td>
                        {request.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-success" 
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              className="btn btn-danger"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleDenyRequest(request.id)}
                            >
                              ✗ Deny
                            </button>
                          </div>
                        )}
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
        <h3 className="card-header">🔓 Granted Permissions ({grantedPermissions.length})</h3>
        {grantedPermissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔓</div>
            <div className="empty-state-title">No Permissions Granted</div>
            <p>You haven't granted access to anyone yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Actions</th>
                  <th>Granted</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grantedPermissions.map((permission) => {
                  const user = umaAccessControl.getUser(permission.userId);
                  return (
                    <tr key={permission.id}>
                      <td><span className="badge badge-secondary">{permission.resourceId}</span></td>
                      <td>{user?.name || permission.userId}</td>
                      <td>
                        {permission.actions.map(action => (
                          <span key={action} className="badge badge-info" style={{ marginRight: '0.25rem' }}>
                            {action}
                          </span>
                        ))}
                      </td>
                      <td>{format(new Date(permission.grantedAt), 'MMM dd, yyyy')}</td>
                      <td>{format(new Date(permission.expiresAt), 'MMM dd, yyyy')}</td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleRevokePermission(permission.id)}
                        >
                          🗑️ Revoke
                        </button>
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
        <h3 className="card-header">📊 Recent Activity on My Resources</h3>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No Activity</div>
            <p>No queries have accessed your resources yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Query</th>
                  <th>Resources</th>
                  <th>Results</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const user = umaAccessControl.getUser(log.userId);
                  return (
                    <tr key={log.id}>
                      <td>{user?.name || log.userId}</td>
                      <td>{log.query}</td>
                      <td>
                        {log.resourcesAccessed.map(res => (
                          <span key={res} className="badge badge-secondary" style={{ marginRight: '0.25rem' }}>
                            {res}
                          </span>
                        ))}
                      </td>
                      <td>{log.resultCount}</td>
                      <td>{log.executionTime}ms</td>
                      <td>{format(new Date(log.timestamp), 'MMM dd HH:mm')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyResources;
