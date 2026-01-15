import React, { useState } from 'react';
import sparqlEngine, { exampleQueries } from '../services/sparqlEngine';
import queryLogger from '../services/queryLogger';
import { format } from 'date-fns';

function SPARQLPlayground({ currentUser }) {
  const [query, setQuery] = useState(exampleQueries[0].query);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);
  const [selectedExample, setSelectedExample] = useState(0);

  const executeQuery = () => {
    setError(null);
    const startTime = performance.now();
    
    try {
      const queryResults = sparqlEngine.executeQuery(query);
      const endTime = performance.now();
      const execTime = Math.round(endTime - startTime);
      
      if (queryResults.error) {
        setError(queryResults.error);
        setResults(null);
      } else {
        setResults(queryResults);
        setExecutionTime(execTime);
        
        // Log the query
        const exampleQuery = exampleQueries[selectedExample];
        queryLogger.logQuery(
          currentUser.id,
          exampleQuery?.name || 'Custom Query',
          query,
          queryResults,
          execTime
        );
      }
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  const loadExample = (index) => {
    setSelectedExample(index);
    setQuery(exampleQueries[index].query);
    setResults(null);
    setError(null);
  };

  const formatValue = (value) => {
    if (!value) return 'N/A';
    
    // If it's a URI, show just the local name
    if (value.value && value.value.includes('/')) {
      const parts = value.value.split('/');
      return parts[parts.length - 1];
    }
    
    return value.value || value;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">SPARQL Query Playground</h1>
        <p className="page-description">
          Execute SPARQL queries against the RDF knowledge graph to explore relationships between photos, photographers, locations, and more.
        </p>
      </div>

      <div className="info-panel">
        <div className="info-panel-title">ℹ️ About SPARQL Queries</div>
        <div className="info-panel-content">
          SPARQL (SPARQL Protocol and RDF Query Language) is the standard query language for RDF data. 
          It allows you to query the knowledge graph using triple patterns, filters, and complex joins. 
          All queries are logged for transparency and audit purposes.
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">📚 Example Queries</h3>
        <div className="grid grid-2">
          {exampleQueries.map((example, idx) => (
            <button
              key={idx}
              className={`btn ${selectedExample === idx ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => loadExample(idx)}
              style={{ textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{example.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{example.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">✏️ Query Editor</h3>
        <textarea
          className="form-textarea"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={12}
          style={{ fontFamily: 'Monaco, monospace', fontSize: '0.875rem' }}
        />
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={executeQuery}>
            ▶️ Execute Query
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-header" style={{ margin: 0 }}>📊 Query Results</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span>⏱️ {executionTime}ms</span>
              <span>📝 {results.count} results</span>
            </div>
          </div>

          {results.count === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No Results</div>
              <p>The query returned no results.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    {results.variables.map((variable, idx) => (
                      <th key={idx}>{variable}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((result, idx) => (
                    <tr key={idx}>
                      {results.variables.map((variable, vidx) => (
                        <td key={vidx}>{formatValue(result[variable])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const csv = [
                  results.variables.join(','),
                  ...results.results.map(r => 
                    results.variables.map(v => formatValue(r[v])).join(',')
                  )
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sparql-results.csv';
                a.click();
              }}
            >
              📥 Export as CSV
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-header">💡 SPARQL Tips</h3>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
          <li>Use PREFIX to define namespace shortcuts (e.g., <code>PREFIX ex: &lt;http://example.org/photos/&gt;</code>)</li>
          <li>Triple patterns match subject-predicate-object: <code>?photo dc:title ?title</code></li>
          <li>Use FILTER to add conditions: <code>FILTER (?date &gt;= "2025-01-01")</code></li>
          <li>Use OPTIONAL for optional patterns that won't exclude results if not matched</li>
          <li>Use ORDER BY to sort results: <code>ORDER BY DESC(?date)</code></li>
          <li>Use LIMIT to restrict the number of results: <code>LIMIT 10</code></li>
          <li>Use regex for pattern matching: <code>FILTER regex(?subject, "Marine", "i")</code></li>
        </ul>
      </div>
    </div>
  );
}

export default SPARQLPlayground;
