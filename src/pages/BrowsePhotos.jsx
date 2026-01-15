import React, { useState, useEffect } from 'react';
import sparqlEngine from '../services/sparqlEngine';
import odrlManager from '../services/odrlManager';
import umaAccessControl from '../services/umaAccessControl';

// Sample photo images (using placeholders)
const photoImages = {
  photo1: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
  photo2: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&h=300&fit=crop',
  photo3: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=300&fit=crop',
  photo4: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  photo5: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=400&h=300&fit=crop',
};

function PhotoCard({ photo, currentUser, onRequestAccess, onViewDetails }) {
  const photoId = photo.photo.value.split('/').pop();
  const title = photo.title?.value || 'Untitled';
  const creator = photo.creator?.value || 'Unknown';
  const date = photo.date?.value || 'Unknown date';
  const description = photo.description?.value || 'No description';

  const owner = umaAccessControl.getResourceOwner(photoId);
  const isOwner = owner === currentUser.id;
  
  const permission = umaAccessControl.hasPermission(currentUser.id, photoId, 'display');
  const canView = permission.hasPermission;

  const policy = odrlManager.getPolicySummary(photoId);

  return (
    <div className="card">
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <img 
          src={photoImages[photoId]} 
          alt={title}
          style={{ 
            width: '100%', 
            height: '200px', 
            objectFit: 'cover', 
            borderRadius: '0.375rem',
            filter: !canView && !isOwner ? 'blur(10px)' : 'none'
          }}
        />
        {!canView && !isOwner && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <div style={{ fontWeight: '600' }}>Access Required</div>
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{title}</h3>
      
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        <div>📸 By {creator}</div>
        <div>📅 {date}</div>
        {isOwner && <div className="badge badge-info" style={{ marginTop: '0.5rem' }}>You own this</div>}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {description}
      </p>

      {policy && (
        <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📋 Policy Summary:</div>
          {policy.permissions.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span className="badge badge-success" style={{ marginRight: '0.5rem' }}>✓</span>
              {policy.permissions[0]}
            </div>
          )}
          {policy.prohibitions.length > 0 && (
            <div>
              <span className="badge badge-danger" style={{ marginRight: '0.5rem' }}>✗</span>
              {policy.prohibitions[0]}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={() => onViewDetails(photoId)}>
          View Details
        </button>
        {!isOwner && !canView && (
          <button className="btn btn-secondary" onClick={() => onRequestAccess(photoId)}>
            Request Access
          </button>
        )}
      </div>
    </div>
  );
}

function PhotoDetailsModal({ photoId, currentUser, onClose }) {
  const [photoData, setPhotoData] = useState(null);
  const [rdfData, setRdfData] = useState('');

  useEffect(() => {
    // Query for complete photo data
    const query = `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX schema: <http://schema.org/>

SELECT ?predicate ?object
WHERE {
  ex:${photoId} ?predicate ?object .
}`;

    const results = sparqlEngine.executeQuery(query);
    setPhotoData(results.results);

    // Get RDF data as N-Triples
    setRdfData(query);
  }, [photoId]);

  const policy = odrlManager.getPolicy(photoId);
  const summary = odrlManager.getPolicySummary(photoId);

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="modal" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Photo Details: {photoId}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <img 
            src={photoImages[photoId]} 
            alt={photoId}
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover', 
              borderRadius: '0.375rem',
              marginBottom: '1.5rem'
            }}
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 RDF Metadata</h3>
            {photoData && photoData.map((triple, idx) => (
              <div key={idx} style={{ 
                padding: '0.5rem', 
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                  {triple['?predicate']?.value.split('/').pop()}
                </span>
                {': '}
                <span style={{ color: 'var(--text-primary)' }}>
                  {triple['?object']?.value}
                </span>
              </div>
            ))}
          </div>

          {summary && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📋 ODRL Policy</h3>
              <div className="info-panel">
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Permissions:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {summary.permissions.map((perm, idx) => (
                      <li key={idx}>{perm}</li>
                    ))}
                  </ul>
                </div>
                {summary.prohibitions.length > 0 && (
                  <div>
                    <strong>Prohibitions:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {summary.prohibitions.map((prohib, idx) => (
                        <li key={idx}>{prohib}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ marginBottom: '1rem' }}>💾 View Source (JSON-LD)</h3>
            <div className="code-block">
              <pre>{JSON.stringify(policy, null, 2)}</pre>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function BrowsePhotos({ currentUser }) {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterPhotographer, setFilterPhotographer] = useState('all');
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    loadPhotos();
  }, [filterLocation, filterPhotographer]);

  const loadPhotos = () => {
    let query = `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?photo ?title ?creator ?date ?description
WHERE {
  ?photo rdf:type ex:ResearchPhoto .
  ?photo dc:title ?title .
  ?photo dc:creator ?creator .
  OPTIONAL { ?photo dcterms:created ?date }
  OPTIONAL { ?photo dc:description ?description }`;

    if (filterLocation !== 'all') {
      query += `\n  ?photo ex:takenAt ex:${filterLocation} .`;
    }

    if (filterPhotographer !== 'all') {
      query += `\n  ?photo ex:hasPhotographer ex:${filterPhotographer} .`;
    }

    query += '\n}';

    const results = sparqlEngine.executeQuery(query);
    setPhotos(results.results || []);
  };

  const handleRequestAccess = (photoId) => {
    const result = umaAccessControl.requestAccess(
      photoId, 
      currentUser.id, 
      'research',
      `I would like to use this photo for my research project.`
    );

    if (result.success) {
      alert('Access request submitted successfully! The owner will be notified.');
    } else {
      alert(result.error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Browse Research Photos</h1>
        <p className="page-description">
          Explore our knowledge graph of research photos with RDF metadata, ODRL policies, and UMA access control.
        </p>
      </div>

      <div className="info-panel">
        <div className="info-panel-title">ℹ️ What's Happening Here?</div>
        <div className="info-panel-content">
          This page demonstrates <strong>RDF data storage</strong> (photos as knowledge graph triples), 
          <strong>ODRL policies</strong> (usage rules for each photo), and <strong>UMA access control</strong> (request 
          access to restricted photos). Each photo is stored with rich metadata using standard vocabularies like 
          Dublin Core, FOAF, and Schema.org.
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Location</label>
            <select 
              className="form-select" 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="greatBarrierReef">Great Barrier Reef</option>
              <option value="arcticCircle">Arctic Circle</option>
              <option value="amazonRainforest">Amazon Rainforest</option>
              <option value="himalayas">Himalayas</option>
              <option value="saharaDesert">Sahara Desert</option>
            </select>
          </div>
          <div>
            <label className="form-label">Photographer</label>
            <select 
              className="form-select"
              value={filterPhotographer}
              onChange={(e) => setFilterPhotographer(e.target.value)}
            >
              <option value="all">All Photographers</option>
              <option value="alice">Alice Johnson</option>
              <option value="bob">Bob Smith</option>
              <option value="carol">Carol Davis</option>
              <option value="david">David Chen</option>
            </select>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📷</div>
          <div className="empty-state-title">No Photos Found</div>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {photos.map((photo, idx) => (
            <PhotoCard 
              key={idx}
              photo={photo}
              currentUser={currentUser}
              onRequestAccess={handleRequestAccess}
              onViewDetails={setSelectedPhoto}
            />
          ))}
        </div>
      )}

      {selectedPhoto && (
        <PhotoDetailsModal 
          photoId={selectedPhoto}
          currentUser={currentUser}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}

export default BrowsePhotos;
