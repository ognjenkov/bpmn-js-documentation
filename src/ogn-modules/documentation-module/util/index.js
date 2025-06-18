import { getBusinessObject, is } from "bpmn-js/lib/util/ModelUtil";
// is se koristi da proveri da li je element koji je typeof Shape da li je odgovarajuci element <npr:element>

export function createElement(elementType, properties, parent, factory) {
  // properties je objekat sa kljucevima i vrednostima, ti kljucevi i vrednosti se ubacuju u novi element kao njegovi kljucevi i vrednosti
  const element = factory.create(elementType, properties); //ovo samo napravi element u javascriptu i onda ga preko parenta i preko komande kasnije zapravo upisemo u xml
  element.$parent = parent;
  // vraca ModdleElement koji ima samo jedan kljuc $parent (osim ako je i properties prosledjen onda ima kljuceve iz tog objekta)
  return element;
}

// sidenote: kakva je ovo glupa sintaksa sa .get("key") zasto ne samo object.key ???
export function getExtensionElementsList(businessObject, type = undefined) {
  // businessObject je ModdleElement, u sebi ima key extensionElements koji je ModdleElement koji ima key values: koji je niz ModdleElementa
  // zasto je values niz? ne znam? zasto nema on kljuceve u sebi za svoju decu kao njegov roditelj? ne znam?
  // mora da je <bpmn:extensionElements> negde pre definisam da ima values kao kljuc, vrv neki custom moddle deskriptor

  // ako je sve tacno sto sam gore napisao mogao bi da se napravi custom neki element umesto <bpmn:extensionElements> gde cemo tacno znati sta se gde nalazi
  const elements =
    (businessObject.get("extensionElements") &&
      businessObject.get("extensionElements").get("values")) ||
    []; // elementi su niz ModdleElementa koji su deca <bpmn:extensionElements>
  // const elements = businessObject.extensionElements?.values || [];

  // ako je type definisan vraca samo elemente tog tipa, ako ne vraca svu decu <bpmn:extensionElements>
  return elements.length && type
    ? elements.filter((value) => is(value, type))
    : elements;
}

export function getImplementationType(element) {
  // vrati vrednost keyja "type" unutar <async:ImplementationDefinition> elemnta
  // ocekuje
  const definition = getImplementationDefinition(element);
  return definition && definition.get("type");
}

export function getImplementationDefinition(element) {
  // udje u element (Shape) i iz njega izvuce element <async:ImplementationDefinition> u tipu (ModdleElement)
  const businessObject = getBusinessObject(element); // shape pretvori u businessObject (ModdleElement)
  const elements = getExtensionElementsList(
    // udje u ModdleElement onda udje u <bpmn:extensionElements> onda vrati listu
    businessObject,
    "async:ImplementationDefinition"
  );

  return (elements || [])[0];
}

export function isSupported(element) {
  // element je Shape tip
  return is(element, "bpmn:Task") || is(element, "bpmn:Event");
}

export function getDocumentationDefinition(element) {
  const businessObject = getBusinessObject(element);
  const elements = getExtensionElementsList(
    businessObject,
    "sistemiv:Documentation"
  );

  return (elements || [])[0];
}

export function getDocumentationTemplate(element) {
  const documentation = getDocumentationDefinition(element);
  return documentation && documentation.get("template");
}
