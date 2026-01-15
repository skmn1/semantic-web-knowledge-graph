/**
 * RDF Data Store
 * Manages RDF triples using the N3 library
 */

import { Store, DataFactory, Parser, Writer } from 'n3';
const { namedNode, literal, quad } = DataFactory;

// Namespace definitions
export const namespaces = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  schema: 'http://schema.org/',
  ex: 'http://example.org/photos/',
  odrl: 'http://www.w3.org/ns/odrl/2/',
};

// Helper function to create URIs
export const uri = (namespace, localName) => {
  return namedNode(namespaces[namespace] + localName);
};

// Initialize RDF store
class RDFStore {
  constructor() {
    this.store = new Store();
    this.initializeOntology();
    this.initializeSampleData();
  }

  // Initialize OWL ontology
  initializeOntology() {
    // Define classes
    this.addTriple(uri('ex', 'Photo'), uri('rdf', 'type'), uri('owl', 'Class'));
    this.addTriple(uri('ex', 'ResearchPhoto'), uri('rdf', 'type'), uri('owl', 'Class'));
    this.addTriple(uri('ex', 'ResearchPhoto'), uri('rdfs', 'subClassOf'), uri('ex', 'Photo'));
    this.addTriple(uri('ex', 'Person'), uri('rdf', 'type'), uri('owl', 'Class'));
    this.addTriple(uri('ex', 'Location'), uri('rdf', 'type'), uri('owl', 'Class'));
    this.addTriple(uri('ex', 'License'), uri('rdf', 'type'), uri('owl', 'Class'));
    this.addTriple(uri('ex', 'ResearchProject'), uri('rdf', 'type'), uri('owl', 'Class'));

    // Define properties
    this.addTriple(uri('ex', 'hasPhotographer'), uri('rdf', 'type'), uri('owl', 'ObjectProperty'));
    this.addTriple(uri('ex', 'hasPhotographer'), uri('rdfs', 'domain'), uri('ex', 'Photo'));
    this.addTriple(uri('ex', 'hasPhotographer'), uri('rdfs', 'range'), uri('ex', 'Person'));

    this.addTriple(uri('ex', 'takenAt'), uri('rdf', 'type'), uri('owl', 'ObjectProperty'));
    this.addTriple(uri('ex', 'takenAt'), uri('rdfs', 'domain'), uri('ex', 'Photo'));
    this.addTriple(uri('ex', 'takenAt'), uri('rdfs', 'range'), uri('ex', 'Location'));

    this.addTriple(uri('ex', 'depicts'), uri('rdf', 'type'), uri('owl', 'ObjectProperty'));
    this.addTriple(uri('ex', 'hasLicense'), uri('rdf', 'type'), uri('owl', 'ObjectProperty'));
    this.addTriple(uri('ex', 'hasOwner'), uri('rdf', 'type'), uri('owl', 'ObjectProperty'));
    this.addTriple(uri('ex', 'partOfProject'), uri('rdf', 'type'), uri('owl', 'ObjectProperty'));

    // Reasoning rule: if someone took a photo, they own it
    this.addTriple(uri('ex', 'hasPhotographer'), uri('rdfs', 'subPropertyOf'), uri('ex', 'hasOwner'));
  }

  // Initialize sample photo data
  initializeSampleData() {
    // Photo 1: Marine Life by Alice
    const photo1 = uri('ex', 'photo1');
    this.addTriple(photo1, uri('rdf', 'type'), uri('ex', 'ResearchPhoto'));
    this.addTriple(photo1, uri('dc', 'title'), literal('Coral Reef Ecosystem'));
    this.addTriple(photo1, uri('dc', 'creator'), literal('Alice Johnson'));
    this.addTriple(photo1, uri('ex', 'hasPhotographer'), uri('ex', 'alice'));
    this.addTriple(photo1, uri('dcterms', 'created'), literal('2025-06-15', uri('xsd', 'date')));
    this.addTriple(photo1, uri('ex', 'takenAt'), uri('ex', 'greatBarrierReef'));
    this.addTriple(photo1, uri('ex', 'depicts'), literal('Coral Reef'));
    this.addTriple(photo1, uri('ex', 'depicts'), literal('Marine Life'));
    this.addTriple(photo1, uri('dc', 'description'), literal('Vibrant coral reef ecosystem with diverse marine species'));
    this.addTriple(photo1, uri('ex', 'hasLicense'), uri('ex', 'license1'));
    this.addTriple(photo1, uri('ex', 'partOfProject'), uri('ex', 'marineResearch'));
    this.addTriple(photo1, uri('schema', 'contentUrl'), literal('/images/photo1.jpg'));

    // Photo 2: Arctic Wildlife by Bob
    const photo2 = uri('ex', 'photo2');
    this.addTriple(photo2, uri('rdf', 'type'), uri('ex', 'ResearchPhoto'));
    this.addTriple(photo2, uri('dc', 'title'), literal('Polar Bear in Natural Habitat'));
    this.addTriple(photo2, uri('dc', 'creator'), literal('Bob Smith'));
    this.addTriple(photo2, uri('ex', 'hasPhotographer'), uri('ex', 'bob'));
    this.addTriple(photo2, uri('dcterms', 'created'), literal('2025-03-22', uri('xsd', 'date')));
    this.addTriple(photo2, uri('ex', 'takenAt'), uri('ex', 'arcticCircle'));
    this.addTriple(photo2, uri('ex', 'depicts'), literal('Polar Bear'));
    this.addTriple(photo2, uri('ex', 'depicts'), literal('Arctic Wildlife'));
    this.addTriple(photo2, uri('dc', 'description'), literal('Adult polar bear hunting on sea ice'));
    this.addTriple(photo2, uri('ex', 'hasLicense'), uri('ex', 'license2'));
    this.addTriple(photo2, uri('ex', 'partOfProject'), uri('ex', 'climateResearch'));
    this.addTriple(photo2, uri('schema', 'contentUrl'), literal('/images/photo2.jpg'));

    // Photo 3: Rainforest by Carol
    const photo3 = uri('ex', 'photo3');
    this.addTriple(photo3, uri('rdf', 'type'), uri('ex', 'ResearchPhoto'));
    this.addTriple(photo3, uri('dc', 'title'), literal('Amazonian Biodiversity'));
    this.addTriple(photo3, uri('dc', 'creator'), literal('Carol Davis'));
    this.addTriple(photo3, uri('ex', 'hasPhotographer'), uri('ex', 'carol'));
    this.addTriple(photo3, uri('dcterms', 'created'), literal('2025-08-10', uri('xsd', 'date')));
    this.addTriple(photo3, uri('ex', 'takenAt'), uri('ex', 'amazonRainforest'));
    this.addTriple(photo3, uri('ex', 'depicts'), literal('Rainforest'));
    this.addTriple(photo3, uri('ex', 'depicts'), literal('Tropical Plants'));
    this.addTriple(photo3, uri('dc', 'description'), literal('Dense rainforest canopy with exotic flora'));
    this.addTriple(photo3, uri('ex', 'hasLicense'), uri('ex', 'license3'));
    this.addTriple(photo3, uri('ex', 'partOfProject'), uri('ex', 'biodiversityResearch'));
    this.addTriple(photo3, uri('schema', 'contentUrl'), literal('/images/photo3.jpg'));

    // Photo 4: Mountain Landscape by Alice
    const photo4 = uri('ex', 'photo4');
    this.addTriple(photo4, uri('rdf', 'type'), uri('ex', 'ResearchPhoto'));
    this.addTriple(photo4, uri('dc', 'title'), literal('Himalayan Glacier Study'));
    this.addTriple(photo4, uri('dc', 'creator'), literal('Alice Johnson'));
    this.addTriple(photo4, uri('ex', 'hasPhotographer'), uri('ex', 'alice'));
    this.addTriple(photo4, uri('dcterms', 'created'), literal('2025-11-05', uri('xsd', 'date')));
    this.addTriple(photo4, uri('ex', 'takenAt'), uri('ex', 'himalayas'));
    this.addTriple(photo4, uri('ex', 'depicts'), literal('Glacier'));
    this.addTriple(photo4, uri('ex', 'depicts'), literal('Mountain'));
    this.addTriple(photo4, uri('dc', 'description'), literal('Retreating glacier in the Himalayas documenting climate change'));
    this.addTriple(photo4, uri('ex', 'hasLicense'), uri('ex', 'license4'));
    this.addTriple(photo4, uri('ex', 'partOfProject'), uri('ex', 'climateResearch'));
    this.addTriple(photo4, uri('schema', 'contentUrl'), literal('/images/photo4.jpg'));

    // Photo 5: Desert Ecosystem by David
    const photo5 = uri('ex', 'photo5');
    this.addTriple(photo5, uri('rdf', 'type'), uri('ex', 'ResearchPhoto'));
    this.addTriple(photo5, uri('dc', 'title'), literal('Sahara Desert Flora'));
    this.addTriple(photo5, uri('dc', 'creator'), literal('David Chen'));
    this.addTriple(photo5, uri('ex', 'hasPhotographer'), uri('ex', 'david'));
    this.addTriple(photo5, uri('dcterms', 'created'), literal('2025-04-18', uri('xsd', 'date')));
    this.addTriple(photo5, uri('ex', 'takenAt'), uri('ex', 'saharaDesert'));
    this.addTriple(photo5, uri('ex', 'depicts'), literal('Desert'));
    this.addTriple(photo5, uri('ex', 'depicts'), literal('Cacti'));
    this.addTriple(photo5, uri('dc', 'description'), literal('Rare desert plant species adapted to extreme conditions'));
    this.addTriple(photo5, uri('ex', 'hasLicense'), uri('ex', 'license5'));
    this.addTriple(photo5, uri('ex', 'partOfProject'), uri('ex', 'biodiversityResearch'));
    this.addTriple(photo5, uri('schema', 'contentUrl'), literal('/images/photo5.jpg'));

    // Define persons
    this.addTriple(uri('ex', 'alice'), uri('rdf', 'type'), uri('ex', 'Person'));
    this.addTriple(uri('ex', 'alice'), uri('foaf', 'name'), literal('Alice Johnson'));
    this.addTriple(uri('ex', 'alice'), uri('foaf', 'mbox'), literal('alice@research.org'));

    this.addTriple(uri('ex', 'bob'), uri('rdf', 'type'), uri('ex', 'Person'));
    this.addTriple(uri('ex', 'bob'), uri('foaf', 'name'), literal('Bob Smith'));
    this.addTriple(uri('ex', 'bob'), uri('foaf', 'mbox'), literal('bob@research.org'));

    this.addTriple(uri('ex', 'carol'), uri('rdf', 'type'), uri('ex', 'Person'));
    this.addTriple(uri('ex', 'carol'), uri('foaf', 'name'), literal('Carol Davis'));
    this.addTriple(uri('ex', 'carol'), uri('foaf', 'mbox'), literal('carol@research.org'));

    this.addTriple(uri('ex', 'david'), uri('rdf', 'type'), uri('ex', 'Person'));
    this.addTriple(uri('ex', 'david'), uri('foaf', 'name'), literal('David Chen'));
    this.addTriple(uri('ex', 'david'), uri('foaf', 'mbox'), literal('david@research.org'));

    // Define locations
    this.addTriple(uri('ex', 'greatBarrierReef'), uri('rdf', 'type'), uri('ex', 'Location'));
    this.addTriple(uri('ex', 'greatBarrierReef'), uri('schema', 'name'), literal('Great Barrier Reef'));
    this.addTriple(uri('ex', 'greatBarrierReef'), uri('schema', 'geo'), literal('Queensland, Australia'));

    this.addTriple(uri('ex', 'arcticCircle'), uri('rdf', 'type'), uri('ex', 'Location'));
    this.addTriple(uri('ex', 'arcticCircle'), uri('schema', 'name'), literal('Arctic Circle'));
    this.addTriple(uri('ex', 'arcticCircle'), uri('schema', 'geo'), literal('Arctic Region'));

    this.addTriple(uri('ex', 'amazonRainforest'), uri('rdf', 'type'), uri('ex', 'Location'));
    this.addTriple(uri('ex', 'amazonRainforest'), uri('schema', 'name'), literal('Amazon Rainforest'));
    this.addTriple(uri('ex', 'amazonRainforest'), uri('schema', 'geo'), literal('Brazil'));

    this.addTriple(uri('ex', 'himalayas'), uri('rdf', 'type'), uri('ex', 'Location'));
    this.addTriple(uri('ex', 'himalayas'), uri('schema', 'name'), literal('Himalayas'));
    this.addTriple(uri('ex', 'himalayas'), uri('schema', 'geo'), literal('Nepal/Tibet'));

    this.addTriple(uri('ex', 'saharaDesert'), uri('rdf', 'type'), uri('ex', 'Location'));
    this.addTriple(uri('ex', 'saharaDesert'), uri('schema', 'name'), literal('Sahara Desert'));
    this.addTriple(uri('ex', 'saharaDesert'), uri('schema', 'geo'), literal('North Africa'));

    // Define research projects
    this.addTriple(uri('ex', 'marineResearch'), uri('rdf', 'type'), uri('ex', 'ResearchProject'));
    this.addTriple(uri('ex', 'marineResearch'), uri('dc', 'title'), literal('Marine Ecosystem Research'));

    this.addTriple(uri('ex', 'climateResearch'), uri('rdf', 'type'), uri('ex', 'ResearchProject'));
    this.addTriple(uri('ex', 'climateResearch'), uri('dc', 'title'), literal('Climate Change Studies'));

    this.addTriple(uri('ex', 'biodiversityResearch'), uri('rdf', 'type'), uri('ex', 'ResearchProject'));
    this.addTriple(uri('ex', 'biodiversityResearch'), uri('dc', 'title'), literal('Biodiversity Conservation'));
  }

  addTriple(subject, predicate, object) {
    this.store.addQuad(quad(subject, predicate, object));
  }

  getStore() {
    return this.store;
  }

  // Get all triples for a subject
  getTriples(subject) {
    return this.store.getQuads(subject, null, null, null);
  }

  // Export store as N-Triples format
  exportNTriples() {
    const writer = new Writer();
    const quads = this.store.getQuads(null, null, null, null);
    return writer.quadsToString(quads);
  }
}

// Create singleton instance
export const rdfStore = new RDFStore();
export default rdfStore;
