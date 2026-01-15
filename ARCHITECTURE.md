# System Architecture Documentation

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Browse  │ │  SPARQL  │ │Resources │ │Policies  │           │
│  │  Photos  │ │Playground│ │ & Access │ │& Audit   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Service Integration Layer                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ UMA Access   │  │ ODRL Policy  │  │ Query        │          │
│  │ Control      │←→│ Manager      │←→│ Logger       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                  ↓                  ↓                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Semantic Web Core Layer                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ RDF Triple   │  │ OWL Ontology │  │ SPARQL Query │          │
│  │ Store (N3)   │←→│ Definitions  │←→│ Engine       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Architecture

### Query Execution Flow

```
User Inputs SPARQL Query
         ↓
┌────────────────────────┐
│  SPARQL Playground     │
│  - Validate syntax     │
│  - Measure time        │
└────────────────────────┘
         ↓
┌────────────────────────┐
│  SPARQL Engine         │
│  - Parse query         │
│  - Match patterns      │
│  - Apply filters       │
│  - Sort & limit        │
└────────────────────────┘
         ↓
┌────────────────────────┐
│  RDF Store (N3)        │
│  - Get matching quads  │
│  - Return bindings     │
└────────────────────────┘
         ↓
┌────────────────────────┐
│  Query Logger          │
│  - Log query details   │
│  - Track resources     │
│  - Update statistics   │
└────────────────────────┘
         ↓
    Return Results
```

### Access Control Flow

```
User Requests Access to Photo
         ↓
┌────────────────────────────────┐
│  UMA Access Control            │
│  - Create access request       │
│  - Notify owner                │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│  Owner Reviews Request         │
│  - View request details        │
│  - Approve or Deny             │
└────────────────────────────────┘
         ↓
   If Approved
         ↓
┌────────────────────────────────┐
│  UMA Creates Permission        │
│  - Grant specific actions      │
│  - Set expiration time         │
│  - Store conditions            │
└────────────────────────────────┘
         ↓
User Attempts Action
         ↓
┌────────────────────────────────┐
│  Authorization Check           │
│  Step 1: UMA Permission?       │
│          ↓                      │
│       Yes → Continue            │
│       No  → Deny                │
│          ↓                      │
│  Step 2: ODRL Policy?          │
│          ↓                      │
│    Check Prohibitions           │
│    Check Permissions            │
│    Evaluate Constraints         │
│    Extract Duties               │
│          ↓                      │
│       Permitted → Allow         │
│       Denied    → Deny          │
└────────────────────────────────┘
         ↓
    Log Access Event
         ↓
    Return Decision
```

## 🗄️ Data Models

### RDF Data Model

```javascript
// Subject-Predicate-Object Triple
{
  subject: NamedNode('http://example.org/photos/photo1'),
  predicate: NamedNode('http://purl.org/dc/elements/1.1/title'),
  object: Literal('Coral Reef Ecosystem')
}

// Complete Photo Graph
Photo {
  URI: ex:photo1
  type: ex:ResearchPhoto
  metadata: {
    title: "Coral Reef Ecosystem"
    creator: "Alice Johnson"
    created: "2025-06-15"^^xsd:date
    description: "Vibrant coral reef..."
  }
  relationships: {
    hasPhotographer: ex:alice
    takenAt: ex:greatBarrierReef
    depicts: ["Coral Reef", "Marine Life"]
    hasLicense: ex:license1
    partOfProject: ex:marineResearch
  }
}
```

### OWL Ontology Model

```turtle
# Classes
ex:Photo a owl:Class .
ex:ResearchPhoto a owl:Class ;
  rdfs:subClassOf ex:Photo .

ex:Person a owl:Class .
ex:Location a owl:Class .
ex:ResearchProject a owl:Class .

# Properties
ex:hasPhotographer a owl:ObjectProperty ;
  rdfs:domain ex:Photo ;
  rdfs:range ex:Person ;
  rdfs:subPropertyOf ex:hasOwner .

ex:takenAt a owl:ObjectProperty ;
  rdfs:domain ex:Photo ;
  rdfs:range ex:Location .

# Reasoning Rules
# Rule: If ?photo ex:hasPhotographer ?person
#       Then ?photo ex:hasOwner ?person
# (Implemented via rdfs:subPropertyOf)
```

### ODRL Policy Model

```javascript
{
  // Policy identifier
  uid: "http://example.org/policy/photo1",
  type: "Set",
  
  // Permissions (what's allowed)
  permission: [
    {
      target: "photo1",
      action: "display",
      assignee: "anyUser",  // Who can do it
      constraint: [],        // Under what conditions
      duty: []               // With what obligations
    },
    {
      target: "photo1",
      action: "use",
      constraint: [
        { purpose: "eq", "research" }  // Only for research
      ],
      duty: [
        { action: "attribute", party: "alice" }  // Must credit
      ]
    }
  ],
  
  // Prohibitions (what's forbidden)
  prohibition: [
    {
      target: "photo1",
      action: "commercialize"  // No commercial use
    }
  ]
}
```

### UMA Access Model

```javascript
// Access Request
{
  id: "uuid-1234",
  resourceId: "photo1",
  requesterId: "bob",
  ownerId: "alice",
  status: "pending",  // pending | approved | denied
  purpose: "research",
  message: "I want to use this for my research...",
  timestamp: Date
}

// Permission Grant
{
  id: "uuid-5678",
  resourceId: "photo1",
  userId: "bob",
  actions: ["display", "use"],
  grantedAt: Date,
  expiresAt: Date,
  conditions: {
    purpose: "research",
    attribution: true
  }
}
```

### Query Log Model

```javascript
{
  id: "uuid-9012",
  userId: "bob",
  query: "Find photos by location",
  queryString: "SELECT ?photo WHERE {...}",
  timestamp: Date,
  resultCount: 3,
  resourcesAccessed: ["photo1", "photo2", "photo3"],
  executionTime: 45  // milliseconds
}
```

## 🔄 Component Interactions

### Browse Photos Component

```
BrowsePhotos
    ↓
    ├─→ sparqlEngine.executeQuery()
    │   └─→ Returns photo metadata
    │
    ├─→ umaAccessControl.hasPermission()
    │   └─→ Check if user can view
    │
    ├─→ odrlManager.getPolicySummary()
    │   └─→ Get human-readable policy
    │
    └─→ Render PhotoCards with access indicators
```

### SPARQL Playground Component

```
SPARQLPlayground
    ↓
    ├─→ User writes/selects query
    ↓
    ├─→ sparqlEngine.executeQuery(query)
    │   ├─→ parseQuery()
    │   ├─→ executeSelect()
    │   │   ├─→ matchPattern() for each triple pattern
    │   │   ├─→ applyFilter() for each FILTER
    │   │   └─→ sort and limit results
    │   └─→ Return { variables, results, count }
    ↓
    ├─→ queryLogger.logQuery()
    │   └─→ Record for audit trail
    ↓
    └─→ Display results in table format
```

### Policy Evaluation Component

```
PolicyTester
    ↓
    ├─→ User selects: photo, action, purpose
    ↓
    ├─→ Check 1: UMA Permission
    │   umaAccessControl.hasPermission(user, photo, action)
    │   └─→ Returns { hasPermission, reason, conditions }
    ↓
    ├─→ Check 2: ODRL Policy
    │   odrlManager.checkPermission(photo, user, action, context)
    │   ├─→ Check prohibitions first
    │   ├─→ Find matching permissions
    │   ├─→ Evaluate constraints
    │   └─→ Returns { permitted, reason, duties }
    ↓
    ├─→ Combine Results
    │   finalDecision = umaGranted && odrlPermitted
    ↓
    └─→ Display decision with explanation
```

## 🧩 Technology Stack Details

### Frontend Layer
```
React 18.2.0
├── React Router 6.20  → Client-side routing
├── Hooks              → useState, useEffect for state
└── Components         → Functional components
```

### Semantic Web Layer
```
N3.js 1.17
├── Store              → In-memory RDF triple storage
├── Parser             → Parse RDF formats
├── Writer             → Serialize RDF
└── DataFactory        → Create RDF terms
```

### Service Layer
```
Custom JavaScript Services
├── rdfStore.js        → RDF + OWL management
├── sparqlEngine.js    → Query processing
├── odrlManager.js     → Policy evaluation
├── umaAccessControl.js → Authorization
└── queryLogger.js     → Audit logging
```

## 📦 Module Dependencies

```
App.jsx
  ↓
  ├─→ BrowsePhotos.jsx
  │     ├─→ sparqlEngine
  │     ├─→ odrlManager
  │     └─→ umaAccessControl
  │
  ├─→ SPARQLPlayground.jsx
  │     ├─→ sparqlEngine
  │     └─→ queryLogger
  │
  ├─→ MyResources.jsx
  │     ├─→ umaAccessControl
  │     ├─→ sparqlEngine
  │     └─→ queryLogger
  │
  ├─→ AccessRequests.jsx
  │     └─→ umaAccessControl
  │
  ├─→ PolicyViewer.jsx
  │     ├─→ odrlManager
  │     └─→ umaAccessControl
  │
  └─→ AuditLog.jsx
        ├─→ queryLogger
        └─→ umaAccessControl

Services:
  rdfStore.js (singleton)
    ↓
  sparqlEngine.js ←→ rdfStore
    ↓
  odrlManager.js (independent)
    ↓
  umaAccessControl.js (independent)
    ↓
  queryLogger.js (independent)
```

## 🔐 Security Considerations

### Current Implementation
- ✅ In-memory data (no persistence security needed)
- ✅ Client-side authorization checks
- ✅ Policy-based access control
- ✅ Audit logging for transparency

### Production Enhancements Needed
- 🔒 Server-side validation
- 🔒 JWT token authentication
- 🔒 HTTPS encryption
- 🔒 Database security
- 🔒 Rate limiting
- 🔒 Input sanitization

## 📈 Performance Characteristics

### Query Performance
- Small dataset (5 photos): < 50ms
- Simple queries: 10-30ms
- Complex queries with filters: 30-50ms
- In-memory operations (very fast)

### Scalability Considerations
- Current: In-memory store (limited by RAM)
- Production: Use triple store (Virtuoso, Jena TDB)
- Indexing: N3.js provides basic indexing
- Caching: Results could be cached for frequent queries

## 🎯 Design Patterns Used

1. **Singleton Pattern**
   - All service modules export singleton instances
   - Ensures single source of truth for data

2. **Factory Pattern**
   - DataFactory for creating RDF terms
   - Standardized term creation

3. **Strategy Pattern**
   - Different policy evaluation strategies (UMA vs ODRL)
   - Pluggable query engines

4. **Observer Pattern**
   - React state management
   - UI updates on data changes

5. **Repository Pattern**
   - Services abstract data access
   - Clean separation of concerns

## 📚 Standards Conformance

### RDF 1.1
- ✅ Triple store
- ✅ Named nodes, literals, blank nodes
- ✅ Multiple serialization formats (via N3)

### SPARQL 1.1 (Subset)
- ✅ SELECT queries
- ✅ Triple patterns with variables
- ✅ FILTER (regex, comparisons)
- ✅ OPTIONAL patterns
- ✅ ORDER BY, LIMIT
- ❌ NOT implemented: CONSTRUCT, ASK, DESCRIBE
- ❌ NOT implemented: Named graphs, UNION

### OWL 2 (Basic)
- ✅ Class definitions
- ✅ Property definitions
- ✅ Domain/Range constraints
- ✅ Property hierarchies (rdfs:subPropertyOf)
- ❌ NOT implemented: Full reasoner
- ❌ NOT implemented: Complex class expressions

### ODRL 2.2
- ✅ Policy structure (Set)
- ✅ Permissions with actions
- ✅ Prohibitions
- ✅ Duties (attribution, compensation)
- ✅ Constraints (purpose, time)
- ✅ JSON-LD serialization

### UMA 2.0 (Conceptual)
- ✅ Access request workflow
- ✅ Permission grants
- ✅ Resource ownership
- ❌ NOT implemented: Full OAuth 2.0 flow
- ❌ NOT implemented: Token-based authorization

---

This architecture enables a fully functional semantic web application that demonstrates how modern linked data standards work together in practice.
