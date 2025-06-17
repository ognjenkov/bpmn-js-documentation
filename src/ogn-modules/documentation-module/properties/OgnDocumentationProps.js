import { forEach } from "min-dash";

import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";

// import { useEffect, useState } from "@bpmn-io/properties-panel/preact/hooks";

import {
  CheckboxEntry,
  isCheckboxEntryEdited,
  FeelTextAreaEntry,
  isFeelTextAreaEntryEdited,
} from "@bpmn-io/properties-panel";

import { useService } from "bpmn-js-properties-panel";

import {
  createElement,
  getImplementationDefinition,
  getImplementationType,
  isSupported,
} from "../util";

const EMPTY_OPTION = "";

export function OgnDocumentationProps(props) {
  const { element } = props; // element je zapravo Shape

  if (!isSupported(element)) {
    return [];
  }

  //potencijalni problem... kako da napravim ako nije edited, mozda odmah na mountu na element da ga napravim?
  const entries = [
    {
      id: "documentation-checkbox",
      component: CreateDocumentationCheckbox,
      isEdited: isSelectEntryEdited,
    },
  ];

  if (getImplementationType(element)) {
    entries.push({
      id: "documentation-feel",
      component: ConnectionKey,
      isEdited: isTextFieldEntryEdited,
    });
  }

  return entries;
}

function CreateDocumentationCheckbox(props) {
  const { element } = props;

  const bpmnFactory = useService("bpmnFactory");
  const commandStack = useService("commandStack");
  const translate = useService("translate");

  const getValue = () => {
    const type = getImplementationType(element);

    return type || EMPTY_OPTION;
  };

  // initiate complex diagram updates via `commandStack`
  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    // (1) ensure extension elements
    let extensionElements = businessObject.get("extensionElements");

    if (!extensionElements) {
      extensionElements = createElement(
        "bpmn:ExtensionElements",
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: "element.updateModdleProperties",
        context: {
          element: element,
          moddleElement: businessObject,
          properties: { extensionElements },
        },
      });
    }

    // (2) ensure implementation definition
    let implementationDefinition = getImplementationDefinition(element);

    if (!implementationDefinition) {
      implementationDefinition = createElement(
        "async:ImplementationDefinition",
        {},
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: "element.updateModdleProperties",
        context: {
          element: element,
          moddleElement: extensionElements,
          properties: [
            {
              values: extensionElements
                .get("values")
                .push(implementationDefinition),
            },
          ],
        },
      });
    }

    // (3) set implementation type
    commands.push({
      cmd: "element.updateModdleProperties",
      context: {
        element: element,
        moddleElement: implementationDefinition,
        properties: { type: value },
      },
    });

    // (4) commit all updates
    commandStack.execute("properties-panel.multi-command-executor", commands);
  };

  // display the fetched options in the select component
  const getOptions = (element) => {
    const options = [{ value: EMPTY_OPTION, label: translate("<none>") }];

    forEach(fetchedOptions, (o) => {
      options.push({ value: o.key, label: translate(o.name) });
    });

    return options;
  };

  return SelectEntry({
    element,
    id: "async-type",
    label: translate("Type"),
    getValue,
    setValue,
    getOptions,
  });
}

function ConnectionKey(props) {
  // OVAKO MU UPDEJTUJES PROPERTI, a preko funkcije type pravis element
  const { element } = props;

  const modeling = useService("modeling");
  const translate = useService("translate");
  const debounce = useService("debounceInput");

  const definition = getImplementationDefinition(element);

  const getValue = () => {
    return definition.get("connectionKey");
  };

  // initiate simple diagram updates via `modeling.updateModdleProperties`
  const setValue = (value) => {
    return modeling.updateModdleProperties(element, definition, {
      connectionKey: value,
    });
  };

  return TextFieldEntry({
    element,
    id: "async-connection",
    label: translate("Connection key"),
    getValue,
    setValue,
    debounce,
  });
}
