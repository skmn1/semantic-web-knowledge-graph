/**
 * SPARQL Query Engine
 * Executes SPARQL queries against the RDF store
 */

import rdfStore, { namespaces, uri } from './rdfStore';
import { DataFactory } from 'n3';
const { namedNode, literal } = DataFactory;

class SPARQLEngine {
  constructor(store) {
    this.store = store.getStore();
  }

  // Simple SPARQL query executor (supports basic SELECT queries)
  executeQuery(queryString) {
    try {
      // Parse the query (simplified parser)
      const parsed = this.parseQuery(queryString);
      
      if (parsed.type === 'SELECT') {
        return this.executeSelect(parsed);
      }
      
      return { error: 'Unsupported query type' };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Simplified SPARQL parser
  parseQuery(queryString) {
    const query = {
      type: null,
      variables: [],
      patterns: [],
      filters: [],
      optional: [],
      limit: null,
      orderBy: null
    };

    // Extract query type
    if (queryString.match(/SELECT/i)) {
      query.type = 'SELECT';
    }

    // Extract variables
    const selectMatch = queryString.match(/SELECT\s+(.*?)\s+WHERE/is);
    if (selectMatch) {
      const varString = selectMatch[1];
      if (varString.trim() === '*') {
        query.variables = ['*'];
      } else {
        query.variables = varString.match(/\?[\w]+/g) || [];
      }
    }

    // Extract WHERE patterns
    const whereMatch = queryString.match(/WHERE\s*\{(.*?)\}/is);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      
      // Extract OPTIONAL blocks
      const optionalRegex = /OPTIONAL\s*\{([^}]+)\}/gi;
      let optionalMatch;
      while ((optionalMatch = optionalRegex.exec(whereClause)) !== null) {
        const optionalPatterns = this.parsePatterns(optionalMatch[1]);
        query.optional.push(optionalPatterns);
      }

      // Remove OPTIONAL blocks and extract main patterns
      const mainClause = whereClause.replace(/OPTIONAL\s*\{[^}]+\}/gi, '');
      
      // Extract FILTER clauses
      const filterRegex = /FILTER\s*\(([^)]+)\)/gi;
      let filterMatch;
      while ((filterMatch = filterRegex.exec(mainClause)) !== null) {
        query.filters.push(filterMatch[1].trim());
      }

      // Remove FILTERs and extract patterns
      const patternsClause = mainClause.replace(/FILTER\s*\([^)]+\)/gi, '');
      query.patterns = this.parsePatterns(patternsClause);
    }

    // Extract LIMIT
    const limitMatch = queryString.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      query.limit = parseInt(limitMatch[1]);
    }

    // Extract ORDER BY
    const orderMatch = queryString.match(/ORDER BY\s+(ASC|DESC)?\s*\(\s*(\?[\w]+)\s*\)/i);
    if (orderMatch) {
      query.orderBy = {
        variable: orderMatch[2],
        direction: orderMatch[1] ? orderMatch[1].toUpperCase() : 'ASC'
      };
    }

    return query;
  }

  // Parse triple patterns
  parsePatterns(clauseString) {
    const patterns = [];
    const lines = clauseString.split(/[.\n]/).filter(l => l.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        patterns.push({
          subject: parts[0],
          predicate: parts[1],
          object: parts.slice(2).join(' ').replace(/[;,]$/, '')
        });
      }
    }

    return patterns;
  }

  // Execute SELECT query
  executeSelect(query) {
    let bindings = [{}]; // Start with one empty binding

    // Process main patterns
    for (const pattern of query.patterns) {
      bindings = this.matchPattern(pattern, bindings, false);
    }

    // Process optional patterns
    for (const optionalPatterns of query.optional) {
      for (const pattern of optionalPatterns) {
        bindings = this.matchPattern(pattern, bindings, true);
      }
    }

    // Apply filters
    for (const filter of query.filters) {
      bindings = this.applyFilter(filter, bindings);
    }

    // Select specific variables or all
    let results = bindings.map(binding => {
      if (query.variables.includes('*')) {
        return binding;
      }
      const result = {};
      for (const v of query.variables) {
        if (binding[v]) {
          result[v] = binding[v];
        }
      }
      return result;
    });

    // Apply ORDER BY
    if (query.orderBy) {
      const variable = query.orderBy.variable;
      const direction = query.orderBy.direction;
      results.sort((a, b) => {
        const aVal = a[variable]?.value || '';
        const bVal = b[variable]?.value || '';
        const comparison = aVal.localeCompare(bVal);
        return direction === 'DESC' ? -comparison : comparison;
      });
    }

    // Apply LIMIT
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return {
      variables: query.variables,
      results: results,
      count: results.length
    };
  }

  // Match a triple pattern against the store
  matchPattern(pattern, currentBindings, isOptional) {
    const newBindings = [];

    for (const binding of currentBindings) {
      const subject = this.resolveValue(pattern.subject, binding);
      const predicate = this.resolveValue(pattern.predicate, binding);
      const object = this.resolveValue(pattern.object, binding);

      const quads = this.store.getQuads(subject, predicate, object, null);

      if (quads.length === 0) {
        // If optional, keep the binding without adding new values
        if (isOptional) {
          newBindings.push(binding);
        }
        continue;
      }

      for (const quad of quads) {
        const newBinding = { ...binding };

        // Bind variables
        if (pattern.subject.startsWith('?')) {
          newBinding[pattern.subject] = this.termToValue(quad.subject);
        }
        if (pattern.predicate.startsWith('?')) {
          newBinding[pattern.predicate] = this.termToValue(quad.predicate);
        }
        if (pattern.object.startsWith('?')) {
          newBinding[pattern.object] = this.termToValue(quad.object);
        }

        newBindings.push(newBinding);
      }
    }

    return newBindings.length > 0 ? newBindings : (isOptional ? currentBindings : []);
  }

  // Resolve a pattern value (variable or literal)
  resolveValue(value, binding) {
    if (value.startsWith('?')) {
      return binding[value] ? this.valueToTerm(binding[value]) : null;
    }
    return this.expandPrefixedName(value);
  }

  // Expand prefixed names (e.g., ex:photo1 -> full URI)
  expandPrefixedName(value) {
    // Remove quotes from literals
    if (value.startsWith('"') && value.endsWith('"')) {
      return literal(value.slice(1, -1));
    }

    // Check for prefixed names
    const match = value.match(/^(\w+):(.+)$/);
    if (match) {
      const [, prefix, localName] = match;
      if (namespaces[prefix]) {
        return namedNode(namespaces[prefix] + localName);
      }
    }

    // Full URI
    if (value.startsWith('<') && value.endsWith('>')) {
      return namedNode(value.slice(1, -1));
    }

    return null;
  }

  // Convert RDF term to value object
  termToValue(term) {
    return {
      type: term.termType,
      value: term.value,
      datatype: term.datatype?.value,
      language: term.language
    };
  }

  // Convert value object to RDF term
  valueToTerm(value) {
    if (value.type === 'NamedNode') {
      return namedNode(value.value);
    } else if (value.type === 'Literal') {
      return literal(value.value);
    }
    return null;
  }

  // Apply a FILTER condition
  applyFilter(filter, bindings) {
    return bindings.filter(binding => {
      // Simple regex filter support
      const regexMatch = filter.match(/regex\s*\(\s*(\?[\w]+)\s*,\s*"([^"]+)"\s*,?\s*"?([^"]*)"?\s*\)/i);
      if (regexMatch) {
        const variable = regexMatch[1];
        const pattern = regexMatch[2];
        const flags = regexMatch[3] || '';
        const value = binding[variable]?.value || '';
        const regex = new RegExp(pattern, flags);
        return regex.test(value);
      }

      // Comparison filters (>, <, >=, <=, =, !=)
      const compMatch = filter.match(/(\?[\w]+)\s*(>=|<=|>|<|=|!=)\s*(.+)/);
      if (compMatch) {
        const variable = compMatch[1];
        const operator = compMatch[2];
        let compareValue = compMatch[3].trim();
        
        // Remove quotes
        if (compareValue.startsWith('"') && compareValue.endsWith('"')) {
          compareValue = compareValue.slice(1, -1);
        }

        const bindingValue = binding[variable]?.value;
        if (!bindingValue) return false;

        switch (operator) {
          case '>': return bindingValue > compareValue;
          case '<': return bindingValue < compareValue;
          case '>=': return bindingValue >= compareValue;
          case '<=': return bindingValue <= compareValue;
          case '=': return bindingValue === compareValue;
          case '!=': return bindingValue !== compareValue;
        }
      }

      return true;
    });
  }
}

// Example queries
export const exampleQueries = [
  {
    name: 'Find all photos',
    description: 'Retrieve all photos with their titles',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?photo ?title
WHERE {
  ?photo rdf:type ex:ResearchPhoto .
  ?photo dc:title ?title .
}`
  },
  {
    name: 'Find photos by photographer',
    description: 'Find all photos taken by Alice Johnson',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?photo ?title ?date
WHERE {
  ?photo ex:hasPhotographer ?photographer .
  ?photographer foaf:name "Alice Johnson" .
  ?photo dc:title ?title .
  OPTIONAL { ?photo dcterms:created ?date }
}`
  },
  {
    name: 'Find photos by location',
    description: 'Find photos taken at the Great Barrier Reef',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX schema: <http://schema.org/>

SELECT ?photo ?title ?description
WHERE {
  ?photo ex:takenAt ex:greatBarrierReef .
  ?photo dc:title ?title .
  ?photo dc:description ?description .
}`
  },
  {
    name: 'Find photos by subject',
    description: 'Find all photos depicting marine life',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?photo ?title ?creator
WHERE {
  ?photo ex:depicts ?subject .
  ?photo dc:title ?title .
  ?photo dc:creator ?creator .
  FILTER regex(?subject, "Marine", "i")
}`
  },
  {
    name: 'Find recent photos',
    description: 'Find photos taken in 2025, ordered by date',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>

SELECT ?photo ?title ?date
WHERE {
  ?photo dcterms:created ?date .
  ?photo dc:title ?title .
  FILTER (?date >= "2025-01-01")
}
ORDER BY DESC(?date)`
  },
  {
    name: 'Find photos by research project',
    description: 'Find photos from Climate Change Studies project',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?photo ?title ?projectName
WHERE {
  ?photo ex:partOfProject ?project .
  ?project dc:title ?projectName .
  ?photo dc:title ?title .
  FILTER regex(?projectName, "Climate", "i")
}`
  },
  {
    name: 'Complex query with multiple filters',
    description: 'Find research photos with multiple criteria',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?photo ?title ?creator ?date
WHERE {
  ?photo rdf:type ex:ResearchPhoto .
  ?photo dc:title ?title .
  ?photo dc:creator ?creator .
  ?photo dcterms:created ?date .
  FILTER (?date >= "2025-03-01" && ?date <= "2025-12-31")
}
ORDER BY DESC(?date)
LIMIT 5`
  },
  {
    name: 'Find all locations',
    description: 'List all locations where photos were taken',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX schema: <http://schema.org/>

SELECT DISTINCT ?location ?name ?geo
WHERE {
  ?photo ex:takenAt ?location .
  ?location schema:name ?name .
  ?location schema:geo ?geo .
}`
  },
  {
    name: 'Find photographers and their photo counts',
    description: 'Get photographer information with photo counts',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?photographer ?name ?photo ?title
WHERE {
  ?photo ex:hasPhotographer ?photographer .
  ?photographer foaf:name ?name .
  ?photo dc:title ?title .
}`
  },
  {
    name: 'Find photos with specific depictions',
    description: 'Find photos depicting either glaciers or deserts',
    query: `PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?photo ?title ?depicts
WHERE {
  ?photo ex:depicts ?depicts .
  ?photo dc:title ?title .
  FILTER (regex(?depicts, "Glacier", "i") || regex(?depicts, "Desert", "i"))
}`
  }
];

// Create singleton instance
export const sparqlEngine = new SPARQLEngine(rdfStore);
export default sparqlEngine;
