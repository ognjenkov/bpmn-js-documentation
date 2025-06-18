import { getBusinessObject, is } from "bpmn-js/lib/util/ModelUtil";

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);
  element.$parent = parent;
  console.log("createElement - element", element);
  return element;
}

export function getExtensionElementsList(businessObject, type = undefined) {
  // console.log("getExtensionElementsList - businessObject", businessObject);
  const elements =
    (businessObject.get("extensionElements") &&
      businessObject.get("extensionElements").get("values")) ||
    [];

  // console.log("getExtensionElementsList - elements", elements);
  // console.log(
  //   "getExtensionElementsList - RETURN",
  //   elements.length && type
  //     ? elements.filter((value) => is(value, type))
  //     : elements
  // );

  return elements.length && type
    ? elements.filter((value) => is(value, type))
    : elements;
}

export function getImplementationType(element) {
  // console.log("getImplementationType - element", element);

  const definition = getImplementationDefinition(element);
  // console.log("getImplementationType - definition", definition);

  return definition && definition.get("type");
}

export function getImplementationDefinition(element) {
  // console.log("getImplementationDefinition - element", element);
  const businessObject = getBusinessObject(element);
  // console.log("getImplementationDefinition - businessObject", businessObject);

  const elements = getExtensionElementsList(
    businessObject,
    "async:ImplementationDefinition"
  );
  // console.log("getImplementationDefinition - elements", elements);

  return (elements || [])[0];
}

export function isSupported(element) {
  return is(element, "bpmn:Task") || is(element, "bpmn:Event");
}
