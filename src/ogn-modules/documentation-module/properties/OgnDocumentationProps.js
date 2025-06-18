import { forEach } from "min-dash"; // zasto koristimo ovaj min-dash?

import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";

import { useEffect, useState } from "@bpmn-io/properties-panel/preact/hooks";

import {
  SelectEntry,
  isSelectEntryEdited,
  TextFieldEntry,
  isTextFieldEntryEdited,
  TextAreaEntry,
  isTextAreaEntryEdited,
  FeelTemplatingEntry,
  FeelTextAreaEntry,
  isFeelEntryEdited,
} from "@bpmn-io/properties-panel";

import { useService } from "bpmn-js-properties-panel";

import { fetchOptions } from "../../../service";

import {
  createElement,
  getImplementationDefinition,
  isSupported,
  getDocumentationDefinition,
  getDocumentationTemplate,
} from "../util";

const EMPTY_OPTION = "";

export function OgnDocumentationProps(props) {
  const { element } = props;
  // element dobijamo u tipu Shape

  if (!isSupported(element)) {
    // ako element(Shape) nije podrzan da se dokumentije vrati prazan niz entrija
    return [];
  }

  const entries = [
    {
      id: "template",
      component: Template,
      isEdited: isSelectEntryEdited,
    },
  ];

  if (getDocumentationTemplate(element)) {
    // ako postoji definisani template (znaci covek zeli da dokumentuje) prikazi mu polje za pisanje dokumentacije ---
    // ako nije nista izabrano, "template" attribut je undefined i to je false,
    // takodje nakon izabranog template-a korisnik moze ponovo da kaze da ipak nece da dokumentira, tada je izabran EMPTY_OPTION="" i javascript ovo vraca false, mozda bolje da se sredi to?
    entries.push({
      id: "documentation-markdown",
      component: DocumentationMarkdown,
      isEdited: isTextAreaEntryEdited,
    });
  }

  return entries;
}

function Template(props) {
  const { element } = props; // dobijamo element u Shape formatu

  const bpmnFactory = useService("bpmnFactory");
  const commandStack = useService("commandStack");

  const [fetchedOptions, setFetchedOptions] = useState([]);

  useEffect(async () => {
    // ovde bi mogli da napravimo proveru za templejte, u zavisnosti od tipa elementa
    const response = await fetchOptions();
    setFetchedOptions(response);
  }, []);

  const getValue = () => {
    const type = getDocumentationTemplate(element); // vrednost ovog inputa treba da bude izvucena iz elementa <sistemiv:Documentation> , trazi se kljuc "template"
    // sidenote: ovo je veoma dangerous operacija cim promeni selekt obrisace mu se prethodno unesena vrednost (ako overrajdujem template!)

    return type || EMPTY_OPTION; // ako je "tempalte" attribut undefined vrati EMPTY_OPTION
  };

  // initiate complex diagram updates via `commandStack`
  const setValue = (value) => {
    // ovde dobijamo value iz naseg select inputa, select input ima niz opcija [{value, label}], nakon izabrane opcije mi imamo samo pristup "value" kljucu
    const commands = [];

    const businessObject = getBusinessObject(element); // shape pretvori u businessObject (ModdleElement)

    // (1) ensure extension elements
    let extensionElements = businessObject.get("extensionElements"); // mislim da je ovo key ugradjen u sve bpmn elemente... to je neki njihov kod...

    if (!extensionElements) {
      extensionElements = createElement(
        // bpmn:ExtensionElements je custom moddle element koji ocekuje da ima values kao kljuc, to predstavlja niz njegove ModdleElement dece
        "bpmn:ExtensionElements", // mozda malo prvo slovo
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        // updejtuje propertije naseg elementa (npr user task) da bude povezan sa novo napravljenim moddleElementom u xml fajlu, (u xml fajlu on je napravljen ali bpmn to ne zna dok ne povezemo)
        cmd: "element.updateModdleProperties",
        context: {
          element: element,
          moddleElement: businessObject,
          properties: { extensionElements },
        },
      });
    }

    // (2) ensure implementation definitionnnnnnnnnnnnnnnnnnnn
    let documentationDefinition = getDocumentationDefinition(element); // vraca <sistemiv:Documentation> u ModdleElement formatu

    if (!documentationDefinition) {
      documentationDefinition = createElement(
        "sistemiv:Documentation",
        {},
        businessObject, // ja bih ovde stavio da mu je parent extensionElements? mozda neka greska?... a mozda onaj $parent u funkciji createElement ne radi nista zapravo?
        bpmnFactory
      );

      commands.push({
        // malo mi je cuda ova sintaksa moramo da prosledimo nas Shape (vrv source komande) i onda da prosledimo koji moddleElement menjamo
        cmd: "element.updateModdleProperties",
        context: {
          element: element,
          moddleElement: extensionElements,
          properties: [
            {
              values: extensionElements // u sustini u sve prethodne values(njegovi pod elementi) dodas <async:ImplementationDefinition> novokreirani
                .get("values")
                .push(documentationDefinition),
            },
          ],
        },
      });
    }

    // (3) set implementation type ////////////// ja cu umesto "type" da upisem "template"
    commands.push({
      cmd: "element.updateModdleProperties",
      context: {
        element: element,
        moddleElement: documentationDefinition,
        properties: { template: value }, // ovde bi trebao "template" pod navodnicima ali ne znam sto mi ne da prettier
      },
    });

    // (4) commit all updates
    commandStack.execute("properties-panel.multi-command-executor", commands);
  };

  // display the fetched options in the select component
  const getOptions = (element) => {
    // ovde dobijamo element u Shape formatu
    const options = [{ value: EMPTY_OPTION, label: "<none>" }];

    forEach(fetchedOptions, (o) => {
      options.push({ value: o.key, label: o.name });
    });

    return options;
  };

  return SelectEntry({
    element,
    id: "template",
    label: "Template",
    getValue,
    setValue,
    getOptions,
  });
}

function DocumentationMarkdown(props) {
  const { element } = props; // element dobijamo u tipu Shape

  const modeling = useService("modeling");
  const debounce = useService("debounceInput");
  //ne moramo da se brinemo da li postoji documentation zato sto se ovaj input ne prikazuje ako ne postoji
  const documentation = getDocumentationDefinition(element); // this returns ModdleElement, znaci ovo mora da mi vrati sistemiv:Documentation

  const getValue = () => {
    return documentation.get("markdown");
  };

  // initiate simple diagram updates via `modeling.updateModdleProperties`
  const setValue = (value) => {
    // element (Shape) je source komande, documentation je moddleElement na kome se vrsi update, i objekat je sta mu se menja (key i value), u nasem jsonu (moddle descriptor) je definisan taj ModdleElement da ima key "markdown" i da se to upisuje string u body
    return modeling.updateModdleProperties(element, documentation, {
      markdown: value,
    });
  };

  return TextAreaEntry({
    element,
    id: "documentation-markdown",
    label: "Markdown",
    getValue,
    setValue,
    debounce,
  });
}
