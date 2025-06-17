import DocumentationPropertiesProvider from "./DocumentationPropertiesProvider";

export default {
  __init__: ["documentationPropertiesProvider"],
  documentationPropertiesProvider: ["type", DocumentationPropertiesProvider],
};

// ovo je sintaksa "didi" dependancy injection paterna....
// documentationPropertiesProvider (linija 5) je zapravo string koji je dodat i od sada moze da se injectuje,
// na taj string su dodati ["type", DocumentationPropertiesProvider] --> "type" (oznacava kalsu ili void funkciju), DocumentationPropertiesProvider je klasa (module) koju zapravo injectujemo
// __init__: ["documentationPropertiesProvider"] ovo samo znaci da inicijalizujemo module pod stringom "documentationPropertiesProvider" cim je registrovan u injector (znaci odmah)
