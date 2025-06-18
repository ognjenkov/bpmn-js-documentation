import { OgnDocumentationProps } from "./properties/OgnDocumentationProps";

import { Group } from "@bpmn-io/properties-panel";

const LOW_PRIORITY = 500;

export default class DocumentationPropertiesProvider {
  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this); // klasa na kojoj se odradi ova komanda , postize to da se iz nje poziva funkcija getGroups kao middleware sa ostalim panelima

    // this._translate = translate; ovo je nacin da module (sevice) pamtis kao promenljivu!!! trebace za viewer (SOON =>>)
  }

  getGroups(element) {
    // element je zapravo Shape
    return (groups) => {
      // u nizu grupa dodajemo nasu grupu
      groups = groups.concat([OgnDocumentationGroup(element)]);

      // (ovo ocisti malo kod, npr ako komponenta nije podrzana nasa grupa je null i to samo izfiltriramo)
      return groups.filter((group) => group !== null);
    };
  }
}

function OgnDocumentationGroup(element) {
  // dobijamo element u Shape tipu
  const group = {
    label: "Ogn Documentation",
    id: "OgnDocumentation",
    component: Group, // ne znam sta postizu ovim, STA JE OVAJ KOD???
    entries: [...OgnDocumentationProps({ element })], // u jednoj grupi moze vise entrija, salje se element u Shape tipu
  };

  if (group.entries.length) {
    // ako ima entrija (ako je element podrzan za dokumentaciju) onda prikazi ovu grupu, inace vrati null (kasnije se null filtrira!)
    return group;
  }

  return null;
}

DocumentationPropertiesProvider.$inject = ["propertiesPanel"]; // ovako dodajes module u konstruktor
