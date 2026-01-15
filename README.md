# Semantic Web Knowledge Graph - Research Photo Sharing Platform

A comprehensive, production-ready web application demonstrating a **Secure Knowledge Graph Federation System** that integrates all major Semantic Web standards: RDF, OWL, SPARQL, ODRL, and UMA with **OpenID Connect (OIDC) authentication**.

![Semantic Web Technologies](https://img.shields.io/badge/Semantic%20Web-RDF%20|%20OWL%20|%20SPARQL%20|%20ODRL%20|%20UMA-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![OIDC](https://img.shields.io/badge/Auth-OIDC-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Project Overview

This educational project demonstrates how modern Semantic Web technologies work together to create a secure, federated knowledge graph system for sharing research photos. It showcases real-world integration of:

- **RDF (Resource Description Framework)** - Knowledge graph data storage
- **OWL (Web Ontology Language)** - Ontology definitions and reasoning
- **SPARQL** - Query language for RDF data
- **ODRL (Open Digital Rights Language)** - Usage policies and permissions
- **UMA (User-Managed Access)** - Authorization and access control
- **OIDC (OpenID Connect)** - Secure authentication with industry-standard providers

## 🔐 Authentication

The application supports **two authentication modes**:

### Demo Mode (Default)
- No configuration required
- Mock users for testing and demonstration
- User switching via UI button
- Perfect for learning and development

### OIDC Mode (Production-Ready)
- Real authentication with OIDC providers (Auth0, Keycloak, Google, Azure AD, etc.)
- Secure token-based authentication
- In-memory session management
- Production-grade security

**Quick Setup**: See [OIDC Setup Guide](docs/OIDC_SETUP.md) for step-by-step configuration.

## ✨ Features

### 📷 Browse Photos
- Explore research photos stored as RDF knowledge graph triples
- Rich metadata using standard vocabularies (Dublin Core, FOAF, Schema.org)
- Filter by location, photographer, and other criteria
- Visual policy indicators showing access permissions

### 🔍 SPARQL Query Playground
- Interactive SPARQL query editor with 10+ example queries
- Real-time query execution against RDF store
- Results visualization with export to CSV
- Query logging for transparency and audit

### 🔐 UMA Access Control
- Request access to restricted photos
- Resource owners approve/deny access requests
- Time-limited permissions with configurable actions
- Complete audit trail of access decisions
- Works with both demo users and OIDC identities

### 📋 ODRL Policy Management
- Define fine-grained usage policies for each photo
- Permissions (display, use, commercialize)
- Prohibitions (explicit denials)
- Duties (attribution, compensation)
- Constraints (purpose, time limits)

### 🛡️ Policy Testing & Reasoning
- Interactive policy tester showing UMA + ODRL integration
- Real-time access decision explanations
- OWL-based reasoning (e.g., photographer → owner inference)

### 📊 Audit Log & Transparency
- Complete query logging with metadata
- Resource access tracking
- Statistics and analytics
- User activity monitoring

## 🏗️ Architecture

### Technology Stack

```
Frontend:
├── React 18.2.0          # UI framework
├── React Router 6.20     # Client-side routing
├── date-fns 2.30         # Date formatting
└── react-oidc-context    # OIDC authentication

Authentication:
├── oidc-client-ts        # OIDC protocol client
└── In-memory sessions    # Secure token storage

Semantic Web:
├── N3.js 1.17            # RDF triple store
├── JSON-LD 8.3           # Linked Data format
└── Custom SPARQL Engine  # Query processor

Build Tools:
└── Vite 5.0              # Development server & bundler
```

### Data Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
│  (Browse, Query, Access Control, Policy Management)     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Authentication Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   OIDC   │  │ Session  │  │   User   │             │
│  │ Provider │←→│ Manager  │←→│ Context  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Integration Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   UMA    │  │  ODRL    │  │  Query   │             │
│  │ Manager  │←→│ Manager  │←→│  Logger  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Semantic Web Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   RDF    │  │   OWL    │  │  SPARQL  │             │
│  │  Store   │←→│ Ontology │←→│  Engine  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /home/kamnis/semanticWeb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start in Demo Mode** (no configuration required)
   ```bash
   npm run dev
   ```
   
4. **Or Configure OIDC Authentication** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your OIDC provider details
   # See docs/OIDC_SETUP.md for detailed instructions
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 How It Works

### 1. RDF Knowledge Graph

Photos are stored as RDF triples using the N3 library:

```turtle
ex:photo1 rdf:type ex:ResearchPhoto .
ex:photo1 dc:title "Coral Reef Ecosystem" .
ex:photo1 ex:hasPhotographer ex:alice .
ex:photo1 dcterms:created "2025-06-15"^^xsd:date .
ex:photo1 ex:takenAt ex:greatBarrierReef .
ex:photo1 ex:depicts "Marine Life" .
```

**Key Vocabularies:**
- `dc:` Dublin Core - Basic metadata (title, creator, description)
- `dcterms:` Dublin Core Terms - Dates and extended metadata
- `foaf:` Friend of a Friend - Person information
- `schema:` Schema.org - General-purpose semantics
- `ex:` Custom namespace - Domain-specific properties

### 2. OWL Ontology

Defines classes and properties with reasoning rules:

```turtle
# Class hierarchy
ex:ResearchPhoto rdfs:subClassOf ex:Photo .

# Property definitions
ex:hasPhotographer rdfs:domain ex:Photo ;
                   rdfs:range ex:Person ;
                   rdfs:subPropertyOf ex:hasOwner .

# Reasoning: If someone took a photo, they own it
# (implemented via rdfs:subPropertyOf)
```

### 3. SPARQL Queries

Query the knowledge graph with SPARQL:

```sparql
PREFIX ex: <http://example.org/photos/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?photo ?title ?creator
WHERE {
  ?photo rdf:type ex:ResearchPhoto .
  ?photo dc:title ?title .
  ?photo dc:creator ?creator .
  FILTER regex(?title, "Marine", "i")
}
```

**Supported Features:**
- Triple patterns with variables
- FILTER clauses (regex, comparisons)
- OPTIONAL patterns
- ORDER BY sorting
- LIMIT for result pagination

### 4. ODRL Policies

Each photo has usage policies defined in ODRL:

```json
{
  "@context": "http://www.w3.org/ns/odrl.jsonld",
  "@type": "Set",
  "permission": [
    {
      "target": "ex:photo1",
      "action": "display",
      "assignee": "ex:anyUser"
    },
    {
      "target": "ex:photo1",
      "action": "use",
      "constraint": [{
        "leftOperand": "purpose",
        "operator": "eq",
        "rightOperand": "research"
      }],
      "duty": [{
        "action": "attribute",
        "attributedParty": "ex:alice"
      }]
    }
  ],
  "prohibition": [
    {
      "target": "ex:photo1",
      "action": "commercialize"
    }
  ]
}
```

**Policy Elements:**
- **Permissions**: Allowed actions with optional constraints and duties
- **Prohibitions**: Explicitly forbidden actions
- **Duties**: Obligations (attribution, compensation)
- **Constraints**: Conditions (purpose, time limits)

### 5. UMA Access Control

User-Managed Access workflow:

1. **Discovery**: User finds a photo they want to access
2. **Request**: User submits access request with purpose
3. **Review**: Resource owner receives notification
4. **Decision**: Owner approves/denies based on ODRL policies
5. **Permission**: If approved, time-limited permission is granted
6. **Enforcement**: System enforces UMA + ODRL policies
7. **Audit**: All access is logged for transparency

### 6. Integration: UMA + ODRL

Access decisions require both systems to approve:

```javascript
// Two-step authorization
const umaPermission = checkUMAPermission(user, resource, action);
const odrlPermission = checkODRLPolicy(resource, action, context);

const finalDecision = umaPermission.granted && odrlPermission.permitted;
```

**Example:**
- User has UMA permission to access photo ✓
- But ODRL prohibits commercial use ✗
- Result: Display allowed, commercial use denied

## 📚 Sample Data

### Photos Included

1. **photo1**: Coral Reef Ecosystem (Alice) - Great Barrier Reef
   - Policy: Display open, research use with attribution, commercial prohibited

2. **photo2**: Polar Bear in Natural Habitat (Bob) - Arctic Circle
   - Policy: Commercial use allowed with compensation

3. **photo3**: Amazonian Biodiversity (Carol) - Amazon Rainforest
   - Policy: Time-limited access, education only, distribution prohibited

4. **photo4**: Himalayan Glacier Study (Alice) - Himalayas
   - Policy: Open access with attribution

5. **photo5**: Sahara Desert Flora (David) - Sahara Desert
   - Policy: View-only, all other uses prohibited

### Mock Users

- **Alice Johnson** - Marine researcher, owns photo1 & photo4
- **Bob Smith** - Arctic wildlife researcher, owns photo2
- **Carol Davis** - Rainforest ecologist, owns photo3
- **David Chen** - Desert ecology specialist, owns photo5

## 🎓 Educational Walkthrough

### Complete User Journey Example

**Scenario**: Bob wants to use Alice's marine photo for research

1. **Browse** → Bob sees photo1 (Coral Reef) but it's blurred (no access)
2. **Request** → Bob clicks "Request Access", explains research purpose
3. **Notification** → Alice sees request in "My Resources" → Access Requests
4. **Approval** → Alice approves, granting display + use permissions
5. **Access** → Bob can now view the photo (UMA permission ✓)
6. **Usage Check** → Bob wants to use for research (ODRL checks purpose ✓)
7. **Duty** → ODRL requires attribution to Alice (shown in policy)
8. **Audit** → All Bob's queries accessing photo1 are logged
9. **Transparency** → Alice can see Bob accessed her photo in audit log

### Try It Yourself

1. **Switch Users**: Click "Switch User" to simulate different perspectives
2. **Request Access**: As Bob, request access to Alice's photos
3. **Approve/Deny**: Switch to Alice, review and approve requests
4. **Query Data**: Use SPARQL playground to explore the knowledge graph
5. **Test Policies**: Use Policy Tester to see UMA + ODRL decisions
6. **Monitor Access**: Check Audit Log to see all activity

## 🔬 Technical Deep Dive

### RDF Store Implementation

Uses N3.js for in-memory triple storage:

```javascript
import { Store, DataFactory } from 'n3';

const store = new Store();
store.addQuad(
  namedNode('ex:photo1'),
  namedNode('dc:title'),
  literal('Coral Reef')
);
```

### SPARQL Engine

Custom SPARQL processor supporting:
- Pattern matching with variables
- Triple joins across patterns
- FILTER evaluation (regex, comparisons)
- OPTIONAL patterns (left joins)
- Result ordering and limits

### OWL Reasoning

Implements property hierarchy reasoning:
```javascript
// If hasPhotographer is a subPropertyOf hasOwner
// Then photographer → owner inference is automatic
```

### ODRL Evaluation

Multi-step policy evaluation:
1. Check prohibitions first (veto power)
2. Find matching permissions
3. Evaluate constraints (purpose, time)
4. Extract duties (obligations)
5. Return decision + explanation

## 🎯 Key Learning Outcomes

After exploring this project, you'll understand:

### Semantic Web Fundamentals
- ✅ How RDF represents knowledge as triples
- ✅ Using standard vocabularies for interoperability
- ✅ OWL ontologies for defining domain models
- ✅ SPARQL for querying linked data

### Advanced Concepts
- ✅ ODRL for expressing digital rights and policies
- ✅ UMA for user-centric access control
- ✅ Combining multiple standards in one system
- ✅ Query logging and transparency for federated graphs

### Real-World Applications
- ✅ Knowledge graph data modeling
- ✅ Fine-grained access control systems
- ✅ Policy-based authorization
- ✅ Audit trails and provenance tracking

## 🏛️ Standards Compliance

This project implements:

- **RDF 1.1** - W3C Recommendation
- **SPARQL 1.1** - W3C Recommendation (subset)
- **OWL 2** - W3C Recommendation (basic features)
- **ODRL 2.2** - W3C Recommendation
- **UMA 2.0** - Kantara Initiative (conceptual implementation)

## 🚧 Future Enhancements

Potential extensions for deeper learning:

1. **Federated Queries**
   - Query multiple remote SPARQL endpoints
   - Merge results from distributed knowledge graphs
   - Cross-source reasoning

2. **Advanced OWL Reasoning**
   - Full reasoner integration (e.g., OWL-RL)
   - Property chains and complex class expressions
   - Consistency checking

3. **SHACL Validation**
   - Shape constraints for data quality
   - Validation reports
   - Data quality monitoring

4. **Real Authentication**
   - OAuth 2.0 integration
   - JWT tokens
   - Actual UMA 2.0 protocol flow

5. **Persistent Storage**
   - Triple store backends (Apache Jena, Virtuoso)
   - Database persistence
   - Import/export RDF formats (Turtle, RDF/XML)

6. **Visual Query Builder**
   - Drag-and-drop SPARQL creation
   - Visual graph exploration
   - Query optimization hints

## 📝 Project Structure

```
semanticWeb/
├── src/
│   ├── components/         # Reusable React components
│   │   └── OidcProvider.jsx # OIDC authentication provider
│   │
│   ├── config/             # Configuration files
│   │   └── oidcConfig.js   # OIDC settings
│   │
│   ├── services/           # Core semantic web services
│   │   ├── rdfStore.js     # RDF triple store & OWL ontology
│   │   ├── sparqlEngine.js # SPARQL query processor
│   │   ├── odrlManager.js  # ODRL policy manager
│   │   ├── umaAccessControl.js # UMA authorization
│   │   ├── sessionManager.js # Authentication session
│   │   └── queryLogger.js  # Audit logging
│   │
│   ├── pages/              # React page components
│   │   ├── BrowsePhotos.jsx
│   │   ├── SPARQLPlayground.jsx
│   │   ├── MyResources.jsx
│   │   ├── AccessRequests.jsx
│   │   ├── PolicyViewer.jsx
│   │   ├── AuditLog.jsx
│   │   └── CallbackPage.jsx # OIDC callback handler
│   │
│   ├── App.jsx             # Main application
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── docs/                   # Documentation
│   ├── OIDC_SETUP.md      # Authentication setup guide
│   ├── OIDC_SECURITY.md   # Security best practices
│   ├── ARCHITECTURE.md    # Technical architecture
│   └── ...                # Additional documentation
│
├── .env.example            # Environment configuration template
├── package.json
├── vite.config.js
└── README.md
```

## 📚 Documentation

- **[OIDC Setup Guide](docs/OIDC_SETUP.md)** - Step-by-step authentication configuration
- **[Security Guide](docs/OIDC_SECURITY.md)** - Security best practices and compliance
- **[Architecture](docs/ARCHITECTURE.md)** - Technical design and implementation
- **[Features](docs/FEATURES.md)** - Comprehensive feature documentation
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🤝 Contributing

This is an educational project. Feel free to:
- Extend with additional semantic web features
- Add more example queries and policies
- Improve the SPARQL engine
- Enhance the UI/UX
- Add documentation

## 📚 References & Resources

### W3C Standards
- [RDF 1.1 Primer](https://www.w3.org/TR/rdf11-primer/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [OWL 2 Primer](https://www.w3.org/TR/owl2-primer/)
- [ODRL Information Model](https://www.w3.org/TR/odrl-model/)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)

### Research Papers
- SaFE-KG: Secure and Federated Knowledge Graphs
- UMA 2.0 Grant for OAuth 2.0 Authorization
- Semantic Web for the Working Ontologist

### Tools & Libraries
- [N3.js](https://github.com/rdfjs/N3.js) - RDF library for JavaScript
- [JSON-LD](https://json-ld.org/) - JSON for Linking Data
- [Apache Jena](https://jena.apache.org/) - RDF framework (Java)
- [react-oidc-context](https://github.com/authts/react-oidc-context) - OIDC for React

## 📄 License

MIT License - feel free to use this project for learning and teaching.

## 🎓 Acknowledgments

This project demonstrates concepts from:
- W3C Semantic Web Activity
- SaFE-KG research initiative
- UMA Working Group
- OpenID Foundation
- Semantic Web community

## 💡 About This Project

Created as a comprehensive educational tool to understand how Semantic Web technologies work together in real-world applications. Perfect for students, researchers, and developers learning about knowledge graphs, linked data, and federated access control systems.

**Key Insight**: The power of Semantic Web comes from *integration* - RDF for data, OWL for ontologies, SPARQL for queries, ODRL for policies, and UMA for access control. Together, they enable secure, federated knowledge graphs that respect user privacy and data ownership while maximizing interoperability and transparency.

---

**Built with ❤️ for the Semantic Web community**
