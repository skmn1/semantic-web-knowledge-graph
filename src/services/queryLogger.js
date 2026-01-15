/**
 * Query Logger
 * Logs all SPARQL queries and resource access for transparency
 */

import { v4 as uuidv4 } from 'uuid';

class QueryLogger {
  constructor() {
    // Query logs: { logId: { userId, query, timestamp, results, resourcesAccessed } }
    this.logs = [];
    this.initializeSampleLogs();
  }

  initializeSampleLogs() {
    // Add some sample log entries
    this.logs.push({
      id: uuidv4(),
      userId: 'alice',
      query: 'Find all photos',
      queryString: 'SELECT ?photo ?title WHERE { ?photo rdf:type ex:ResearchPhoto . ?photo dc:title ?title . }',
      timestamp: new Date('2026-01-12T09:15:00'),
      resultCount: 5,
      resourcesAccessed: ['photo1', 'photo2', 'photo3', 'photo4', 'photo5'],
      executionTime: 45
    });

    this.logs.push({
      id: uuidv4(),
      userId: 'bob',
      query: 'Find photos by location',
      queryString: 'SELECT ?photo ?title WHERE { ?photo ex:takenAt ex:arcticCircle . }',
      timestamp: new Date('2026-01-13T14:30:00'),
      resultCount: 1,
      resourcesAccessed: ['photo2'],
      executionTime: 23
    });

    this.logs.push({
      id: uuidv4(),
      userId: 'carol',
      query: 'Find photos depicting marine life',
      queryString: 'SELECT ?photo WHERE { ?photo ex:depicts ?subject . FILTER regex(?subject, "Marine", "i") }',
      timestamp: new Date('2026-01-14T11:45:00'),
      resultCount: 1,
      resourcesAccessed: ['photo1'],
      executionTime: 31
    });

    this.logs.push({
      id: uuidv4(),
      userId: 'alice',
      query: 'Find recent photos',
      queryString: 'SELECT ?photo ?date WHERE { ?photo dcterms:created ?date . FILTER (?date >= "2025-01-01") }',
      timestamp: new Date('2026-01-15T08:20:00'),
      resultCount: 5,
      resourcesAccessed: ['photo1', 'photo2', 'photo3', 'photo4', 'photo5'],
      executionTime: 52
    });
  }

  // Log a query
  logQuery(userId, queryName, queryString, results, executionTime) {
    const log = {
      id: uuidv4(),
      userId,
      query: queryName,
      queryString,
      timestamp: new Date(),
      resultCount: results.count || 0,
      resourcesAccessed: this.extractResourcesFromResults(results),
      executionTime: executionTime || 0
    };

    this.logs.push(log);
    return log;
  }

  // Extract resource IDs from query results
  extractResourcesFromResults(results) {
    const resources = new Set();
    
    if (results.results) {
      for (const result of results.results) {
        for (const key in result) {
          const value = result[key]?.value;
          if (value && typeof value === 'string') {
            // Extract photo IDs from URIs
            const match = value.match(/photo\d+/);
            if (match) {
              resources.add(match[0]);
            }
          }
        }
      }
    }

    return Array.from(resources);
  }

  // Get all logs
  getAllLogs() {
    return [...this.logs].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // Get logs by user
  getLogsByUser(userId) {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get logs for a specific resource
  getLogsForResource(resourceId) {
    return this.logs
      .filter(log => log.resourcesAccessed.includes(resourceId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get logs within a date range
  getLogsByDateRange(startDate, endDate) {
    return this.logs
      .filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get query statistics
  getStatistics() {
    const stats = {
      totalQueries: this.logs.length,
      uniqueUsers: new Set(this.logs.map(log => log.userId)).size,
      totalResourcesAccessed: 0,
      mostQueriedResources: {},
      mostActiveUsers: {},
      averageExecutionTime: 0,
      queriesByDay: {}
    };

    let totalExecTime = 0;

    for (const log of this.logs) {
      // Count resource accesses
      for (const resource of log.resourcesAccessed) {
        stats.mostQueriedResources[resource] = 
          (stats.mostQueriedResources[resource] || 0) + 1;
        stats.totalResourcesAccessed++;
      }

      // Count user activity
      stats.mostActiveUsers[log.userId] = 
        (stats.mostActiveUsers[log.userId] || 0) + 1;

      // Sum execution time
      totalExecTime += log.executionTime || 0;

      // Count queries by day
      const day = new Date(log.timestamp).toLocaleDateString();
      stats.queriesByDay[day] = (stats.queriesByDay[day] || 0) + 1;
    }

    stats.averageExecutionTime = this.logs.length > 0 
      ? (totalExecTime / this.logs.length).toFixed(2) 
      : 0;

    // Convert to sorted arrays
    stats.mostQueriedResources = Object.entries(stats.mostQueriedResources)
      .sort((a, b) => b[1] - a[1])
      .map(([resource, count]) => ({ resource, count }));

    stats.mostActiveUsers = Object.entries(stats.mostActiveUsers)
      .sort((a, b) => b[1] - a[1])
      .map(([userId, count]) => ({ userId, count }));

    return stats;
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
  }

  // Get recent logs (last N)
  getRecentLogs(count = 10) {
    return this.getAllLogs().slice(0, count);
  }
}

// Create singleton instance
export const queryLogger = new QueryLogger();
export default queryLogger;
