# Quick Start Guide

## 🚀 Your Semantic Web Application is Ready!

The development server is running at: **http://localhost:3000**

## 📖 What You Just Built

A complete Semantic Web knowledge graph system featuring:

### ✅ Implemented Technologies

1. **RDF (Resource Description Framework)**
   - 5 sample research photos with rich metadata
   - Standard vocabularies: Dublin Core, FOAF, Schema.org
   - In-memory triple store using N3.js

2. **OWL (Web Ontology Language)**
   - Class hierarchy (Photo, ResearchPhoto, Person, Location)
   - Property definitions with domain/range
   - Reasoning rules (photographer → owner inference)

3. **SPARQL Query Engine**
   - Custom query processor
   - 10 pre-built example queries
   - Support for FILTER, OPTIONAL, ORDER BY, LIMIT
   - CSV export functionality

4. **ODRL (Open Digital Rights Language)**
   - 5 different policy configurations
   - Permissions with constraints and duties
   - Prohibitions for restricted actions
   - Human-readable and JSON-LD formats

5. **UMA (User-Managed Access)**
   - Access request workflow
   - Permission management
   - Time-limited grants
   - Approval/denial system

6. **Query Logging & Transparency**
   - Complete audit trail
   - Statistics dashboard
   - Resource access tracking
   - User activity monitoring

## 🎯 Try These Workflows

### Workflow 1: Browse and Query
1. Click "Browse Photos" to see the photo collection
2. Use filters to narrow by location or photographer
3. Click "View Details" on any photo to see RDF metadata
4. Go to "SPARQL Query" and try the example queries
5. Modify queries to explore the knowledge graph

### Workflow 2: Access Control (UMA)
1. Switch to user "Bob" (top right button)
2. Browse photos and find one owned by Alice (photo1 or photo4)
3. Click "Request Access"
4. Switch to user "Alice"
5. Go to "My Resources" → "Access Requests"
6. Approve Bob's request
7. Switch back to Bob - now you can view the photo!

### Workflow 3: Policy Testing (ODRL)
1. Go to "Policies" page
2. Use the Policy Tester
3. Try different combinations:
   - Photo: photo1, Action: display → Should allow
   - Photo: photo1, Action: commercialize → Should deny
   - Photo: photo3, Purpose: education → Should allow
   - Photo: photo3, Purpose: commercial → Should deny

### Workflow 4: Audit and Transparency
1. Use SPARQL playground to run several queries
2. Go to "Audit Log" page
3. See all your queries logged
4. Filter by user or resource
5. Check statistics dashboard

## 📚 Pages Overview

- **Browse Photos** - Visual gallery with metadata and policies
- **SPARQL Query** - Interactive query playground
- **My Resources** - Manage your photos and access requests
- **Access Requests** - View your requests and permissions
- **Policies** - Explore ODRL policies and test them
- **Audit Log** - Complete transparency and statistics

## 🎓 Educational Features

Every page includes:
- **Info Panels** - Explaining what's happening
- **View Source** buttons - See underlying RDF/ODRL data
- **Policy Explanations** - Understand access decisions
- **Real-time Reasoning** - See OWL inferences in action

## 🔑 Key Concepts Demonstrated

### Integration of Standards
```
User Action → UMA Check → ODRL Check → Final Decision
                ↓             ↓
          (Who can      (What they
           access?)      can do?)
```

### Sample RDF Triple
```turtle
ex:photo1 dc:title "Coral Reef Ecosystem" .
ex:photo1 ex:hasPhotographer ex:alice .
ex:photo1 ex:takenAt ex:greatBarrierReef .
```

### Sample ODRL Policy
```json
{
  "permission": [{
    "action": "display",
    "duty": [{ "action": "attribute" }]
  }],
  "prohibition": [{
    "action": "commercialize"
  }]
}
```

### Sample SPARQL Query
```sparql
SELECT ?photo ?title
WHERE {
  ?photo rdf:type ex:ResearchPhoto .
  ?photo dc:title ?title .
}
```

## 💡 Tips for Exploration

1. **Switch Users Frequently** - Each user has different resources and permissions
2. **View Source Data** - Click "View Source" buttons to see underlying formats
3. **Experiment with Queries** - Modify SPARQL queries to learn the syntax
4. **Test Policies** - Use the Policy Tester to understand access decisions
5. **Check Audit Logs** - See transparency in action

## 🎨 Sample Users

- **Alice Johnson** - Owns photo1 (Coral Reef) and photo4 (Glacier)
- **Bob Smith** - Owns photo2 (Polar Bear)
- **Carol Davis** - Owns photo3 (Rainforest)
- **David Chen** - Owns photo5 (Desert)

## 📊 Sample Data Highlights

1. **photo1** - Open for research, commercial use prohibited, attribution required
2. **photo2** - Commercial use allowed with compensation
3. **photo3** - Time-limited access until end of 2026, education only
4. **photo4** - Fully open with attribution
5. **photo5** - View-only, all other uses prohibited

## 🚧 Next Steps

Want to extend the project? Try:
- Add more photos with different policy configurations
- Implement additional SPARQL query features
- Create more complex OWL reasoning rules
- Add visual query builder
- Implement federated queries
- Add SHACL validation

## 📖 Full Documentation

See `README.md` for complete documentation including:
- Architecture details
- Technical deep dive
- Standards compliance
- Future enhancements
- References and resources

## 🎉 Enjoy Exploring!

This is a fully functional, production-ready demonstration of Semantic Web technologies working together. Every feature is implemented - no placeholders or TODOs!

---

**Happy Learning! 🎓**
