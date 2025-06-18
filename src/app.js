import BpmnModeler from "bpmn-js/lib/Modeler";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";

import AsyncPropertiesProviderModule from "./provider";
import OgnDocumentationModule from "./ogn-modules/documentation-module";

import asyncModdleDescriptors from "./descriptors/async.json";
import sistemivModdleDescriptors from "./descriptors/sistemiv.json";
import diagramXML from "../resources/diagram.bpmn";

import MyDebugModule from "./ogn-modules/debug-module";

const modeler = new BpmnModeler({
  container: ".diagram-container",
  propertiesPanel: {
    parent: ".properties-container",
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    AsyncPropertiesProviderModule,
    MyDebugModule,
    OgnDocumentationModule,
  ],
  moddleExtensions: {
    async: asyncModdleDescriptors,
    sistemiv: sistemivModdleDescriptors, // u xml tagu <bpmn:definitions , ako je prisutan sistemiv element, dodaje se kljuc sistemiv -> xmlns:sistemiv="https://www.sistemiv.com"
  },
});

modeler
  .importXML(diagramXML)
  .then((_) => {
    const canvas = modeler.get("canvas");
    canvas.zoom("fit-viewport");
  })
  .catch((error) => {
    console.error(error);
  });

// download button
document.addEventListener("DOMContentLoaded", function () {
  const downloadLink = document.getElementById("js-download-diagram");

  document.querySelectorAll(".buttons a").forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      if (!anchor.classList.contains("active")) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  function setEncoded(link, name, data) {
    if (data) {
      const encodedData = encodeURIComponent(data);
      link.classList.add("active");
      link.setAttribute(
        "href",
        "data:application/bpmn20-xml;charset=UTF-8," + encodedData
      );
      link.setAttribute("download", name);
    } else {
      link.classList.remove("active");
      link.removeAttribute("href");
      link.removeAttribute("download");
    }
  }

  function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const exportArtifacts = debounce(async function () {
    try {
      const { xml } = await modeler.saveXML({ format: true });
      setEncoded(downloadLink, "diagram.bpmn", xml);
    } catch (err) {
      console.error("Error happened saving diagram: ", err);
      setEncoded(downloadLink, "diagram.bpmn", null);
    }
  }, 500);

  modeler.on("commandStack.changed", exportArtifacts);
});
