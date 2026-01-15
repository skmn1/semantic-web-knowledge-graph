import React, { useState } from 'react';
import odrlManager, { odrlPolicies } from '../services/odrlManager';
import umaAccessControl from '../services/umaAccessControl';

function PolicyCard({ photoId, policy }) {
  const [showSource, setShowSource] = useState(false);
  const summary = odrlManager.getPolicySummary(photoId);
  const owner = umaAccessControl.getResourceOwner(photoId);
  const ownerUser = umaAccessControl.getUser(owner);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>{photoId}</h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Owner: {ownerUser?.name || owner}
          </div>
        </div>
        <button 
          className="btn btn-outline"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          onClick={() => setShowSource(!showSource)}
        >
          {showSource ? '📋 View Summary' : '💾 View Source'}
        </button>
      </div>

      {!showSource ? (
        <div>
          {summary && (
            <>
              {summary.permissions.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                    ✅ Permissions
                  </div>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                    {summary.permissions.map((perm, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{perm}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.prohibitions.length > 0 && (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--danger-color)', marginBottom: '0.5rem' }}>
                    ❌ Prohibitions
                  </div>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                    {summary.prohibitions.map((prohib, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{prohib}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="code-block">
          <pre>{JSON.stringify(policy, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function PolicyTester({ currentUser }) {
  const [selectedPhoto, setSelectedPhoto] = useState('photo1');
  const [selectedAction, setSelectedAction] = useState('display');
  const [purpose, setPurpose] = useState('research');
  const [testResult, setTestResult] = useState(null);

  const actions = ['display', 'use', 'commercialize', 'distribute', 'modify'];
  const purposes = ['research', 'education', 'commercial', 'general'];

  const runTest = () => {
    // Check UMA permission first
    const umaPermission = umaAccessControl.hasPermission(currentUser.id, selectedPhoto, selectedAction);
    
    // Check ODRL policy
    const odrlPermission = odrlManager.checkPermission(
      selectedPhoto, 
      currentUser.id, 
      selectedAction,
      { purpose }
    );

    // Combine both results
    const finalDecision = umaPermission.hasPermission && odrlPermission.permitted;
    
    setTestResult({
      uma: umaPermission,
      odrl: odrlPermission,
      finalDecision,
      explanation: getFinalExplanation(umaPermission, odrlPermission, finalDecision)
    });
  };

  const getFinalExplanation = (uma, odrl, final) => {
    if (!uma.hasPermission) {
      return `❌ Access denied by UMA: ${uma.reason}. You need to request access from the owner first.`;
    }
    if (!odrl.permitted) {
      return `❌ Access denied by ODRL policy: ${odrl.reason}. Even though you have UMA permission, the policy prohibits this action.`;
    }
    if (final) {
      let explanation = `✅ Access granted! Both UMA and ODRL policies permit this action.`;
      if (odrl.duties && odrl.duties.length > 0) {
        explanation += ` However, you must fulfill these duties: ${odrl.duties.map(d => d.description).join('; ')}.`;
      }
      return explanation;
    }
    return `❌ Access denied.`;
  };

  return (
    <div className="card">
      <h3 className="card-header">🧪 Policy Tester</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Test how UMA and ODRL policies work together to make access control decisions.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label className="form-label">Photo</label>
          <select className="form-select" value={selectedPhoto} onChange={(e) => setSelectedPhoto(e.target.value)}>
            <option value="photo1">photo1</option>
            <option value="photo2">photo2</option>
            <option value="photo3">photo3</option>
            <option value="photo4">photo4</option>
            <option value="photo5">photo5</option>
          </select>
        </div>

        <div>
          <label className="form-label">Action</label>
          <select className="form-select" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Purpose</label>
          <select className="form-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {purposes.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn btn-primary" onClick={runTest}>
        🧪 Test Policy
      </button>

      {testResult && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className={`alert ${testResult.finalDecision ? 'alert-success' : 'alert-error'}`}>
            <strong>Final Decision:</strong> {testResult.explanation}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="info-panel" style={{ backgroundColor: testResult.uma.hasPermission ? '#d1fae5' : '#fee2e2' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                {testResult.uma.hasPermission ? '✅' : '❌'} UMA Check
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <div><strong>Result:</strong> {testResult.uma.reason}</div>
                {testResult.uma.conditions && Object.keys(testResult.uma.conditions).length > 0 && (
                  <div><strong>Conditions:</strong> {JSON.stringify(testResult.uma.conditions)}</div>
                )}
              </div>
            </div>

            <div className="info-panel" style={{ backgroundColor: testResult.odrl.permitted ? '#d1fae5' : '#fee2e2' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                {testResult.odrl.permitted ? '✅' : '❌'} ODRL Check
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <div><strong>Result:</strong> {testResult.odrl.reason}</div>
                {testResult.odrl.duties && testResult.odrl.duties.length > 0 && (
                  <div>
                    <strong>Duties:</strong>
                    <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                      {testResult.odrl.duties.map((duty, idx) => (
                        <li key={idx}>{duty.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PolicyViewer({ currentUser }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ODRL Policy Viewer</h1>
        <p className="page-description">
          View and understand ODRL (Open Digital Rights Language) policies that control usage of photos.
        </p>
      </div>

      <div className="info-panel">
        <div className="info-panel-title">ℹ️ About ODRL</div>
        <div className="info-panel-content">
          ODRL is a standard for expressing permissions, prohibitions, and obligations (duties) regarding digital content. 
          Each photo has an ODRL policy that defines what actions are allowed (e.g., display, use, commercialize), 
          under what conditions (e.g., for research purposes only), and what duties must be fulfilled (e.g., attribution required). 
          ODRL works together with UMA: UMA controls <em>who</em> gets access, while ODRL defines <em>what</em> they can do with it.
        </div>
      </div>

      <PolicyTester currentUser={currentUser} />

      <div className="card">
        <h3 className="card-header">📚 All Photo Policies</h3>
        <div className="grid grid-2">
          {Object.entries(odrlPolicies).map(([photoId, policy]) => (
            <PolicyCard key={photoId} photoId={photoId} policy={policy} />
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">📖 ODRL Policy Structure</h3>
        <div style={{ color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '1rem' }}>
            An ODRL policy consists of:
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <strong>1. Permissions</strong>
            <p>Actions that are allowed, possibly with constraints and duties:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><code>action</code>: What can be done (display, use, commercialize, etc.)</li>
              <li><code>constraint</code>: Conditions that must be met (purpose, time limits, etc.)</li>
              <li><code>duty</code>: Obligations that must be fulfilled (attribution, compensation, etc.)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>2. Prohibitions</strong>
            <p>Actions that are explicitly forbidden, regardless of other permissions.</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>3. Example Policy Configurations</strong>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Open Research:</strong> Display allowed for anyone, use allowed for research with attribution required</li>
              <li><strong>Commercial:</strong> Commercial use allowed but requires compensation to owner</li>
              <li><strong>Time-Limited:</strong> Access expires after a specific date</li>
              <li><strong>Purpose-Restricted:</strong> Only allowed for specific purposes (education, research, etc.)</li>
              <li><strong>View-Only:</strong> Display allowed, but use and modification prohibited</li>
            </ul>
          </div>

          <div>
            <strong>How It Works With UMA</strong>
            <p style={{ marginTop: '0.5rem' }}>
              The system makes a two-step authorization decision:
            </p>
            <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>UMA checks if you have permission to access the resource at all</li>
              <li>ODRL checks if the specific action is permitted by the policy</li>
              <li>Both must approve for the action to be allowed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PolicyViewer;
