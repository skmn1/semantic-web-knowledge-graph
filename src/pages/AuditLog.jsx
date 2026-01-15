import React, { useState, useEffect } from 'react';
import queryLogger from '../services/queryLogger';
import umaAccessControl from '../services/umaAccessControl';
import { format } from 'date-fns';

function AuditLog({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterUser, setFilterUser] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadData();
  }, [filterUser, filterResource]);

  const loadData = () => {
    let filteredLogs = queryLogger.getAllLogs();

    if (filterUser !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.userId === filterUser);
    }

    if (filterResource !== 'all') {
      filteredLogs = filteredLogs.filter(log => 
        log.resourcesAccessed.includes(filterResource)
      );
    }

    setLogs(filteredLogs);
    setStats(queryLogger.getStatistics());
  };

  const users = umaAccessControl.getAllUsers();
  const resources = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Audit Log & Query Transparency</h1>
        <p className="page-description">
          Complete transparency into all SPARQL queries executed and resources accessed.
        </p>
      </div>

      <div className="info-panel">
        <div className="info-panel-title">ℹ️ Why Query Logging Matters</div>
        <div className="info-panel-content">
          Transparency is crucial in knowledge graph systems. This audit log records <strong>every SPARQL query</strong> executed, 
          showing who queried what, when, and which resources were accessed. Resource owners can see who's using their 
          data, and users can verify the system's behavior. This aligns with the <strong>SaFE-KG principles</strong> of 
          secure and federated knowledge graphs with full auditability.
        </div>
      </div>

      {stats && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-header">📊 Statistics</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  {stats.totalQueries}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Queries</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
                  {stats.uniqueUsers}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Users</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning-color)' }}>
                  {stats.totalResourcesAccessed}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Resources Accessed</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {stats.averageExecutionTime}ms
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg Execution Time</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-header">🔥 Most Queried Resources</h3>
            {stats.mostQueriedResources.slice(0, 5).map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.75rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <span className="badge badge-secondary">{item.resource}</span>
                <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                  {item.count} queries
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="card-header">👥 Most Active Users</h3>
            {stats.mostActiveUsers.map((item, idx) => {
              const user = umaAccessControl.getUser(item.userId);
              return (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span>{user?.name || item.userId}</span>
                  <span style={{ fontWeight: '600', color: 'var(--secondary-color)' }}>
                    {item.count} queries
                  </span>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3 className="card-header">📅 Queries by Day</h3>
            {Object.entries(stats.queriesByDay)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .slice(0, 5)
              .map(([day, count], idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span>{day}</span>
                  <span style={{ fontWeight: '600' }}>{count} queries</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-header">🔍 Filter Logs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">User</label>
            <select className="form-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Resource</label>
            <select className="form-select" value={filterResource} onChange={(e) => setFilterResource(e.target.value)}>
              <option value="all">All Resources</option>
              {resources.map(res => (
                <option key={res} value={res}>{res}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">📜 Query Log ({logs.length} entries)</h3>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <div className="empty-state-title">No Logs</div>
            <p>No queries match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Query</th>
                  <th>Resources</th>
                  <th>Results</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const user = umaAccessControl.getUser(log.userId);
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.875rem' }}>
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                        <br />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                      </td>
                      <td>{user?.name || log.userId}</td>
                      <td style={{ fontWeight: '500' }}>{log.query}</td>
                      <td>
                        {log.resourcesAccessed.map(res => (
                          <span key={res} className="badge badge-secondary" style={{ marginRight: '0.25rem' }}>
                            {res}
                          </span>
                        ))}
                      </td>
                      <td>{log.resultCount}</td>
                      <td>{log.executionTime}ms</td>
                      <td>
                        <button 
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => setSelectedLog(log)}
                        >
                          View
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

      {selectedLog && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setSelectedLog(null);
        }}>
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Query Details</h2>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>📊 Metadata</h3>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div>
                    <strong>User:</strong> {umaAccessControl.getUser(selectedLog.userId)?.name || selectedLog.userId}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {format(new Date(selectedLog.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </div>
                  <div>
                    <strong>Query Name:</strong> {selectedLog.query}
                  </div>
                  <div>
                    <strong>Execution Time:</strong> {selectedLog.executionTime}ms
                  </div>
                  <div>
                    <strong>Results:</strong> {selectedLog.resultCount}
                  </div>
                  <div>
                    <strong>Resources Accessed:</strong> {selectedLog.resourcesAccessed.join(', ')}
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>📝 SPARQL Query</h3>
                <div className="code-block">
                  <pre>{selectedLog.queryString}</pre>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-header">🎓 Educational: Why This Matters</h3>
        <div style={{ color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '1rem' }}>
            Query logging is essential for <strong>trustworthy knowledge graph systems</strong>:
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <strong>For Resource Owners:</strong>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>See who's accessing your data and how they're using it</li>
              <li>Detect unusual access patterns or potential misuse</li>
              <li>Make informed decisions about granting future access</li>
              <li>Verify that policies are being enforced correctly</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>For Users:</strong>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Understand what data you've accessed and when</li>
              <li>Audit your own query history for research reproducibility</li>
              <li>Verify that the system is behaving as expected</li>
            </ul>
          </div>

          <div>
            <strong>For the System:</strong>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Maintain a complete audit trail for compliance</li>
              <li>Enable provenance tracking for scientific research</li>
              <li>Support debugging and system optimization</li>
              <li>Demonstrate accountability in federated knowledge graphs</li>
            </ul>
          </div>

          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            This transparency is a key differentiator of modern semantic web systems and aligns with 
            the principles outlined in the SaFE-KG (Secure and Federated Knowledge Graphs) research.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuditLog;
