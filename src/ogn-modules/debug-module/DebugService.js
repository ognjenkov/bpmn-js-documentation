import { useService } from "bpmn-js-properties-panel";

export const debugServiceType = "debugService";

export function DebugService(injector) {
  console.log("[Available services]", Object.keys(injector._providers).length);
  console.log("[Available services]", Object.keys(injector._providers));

  // testContext();
}

DebugService.$inject = ["injector"];

// function testContext() {
//   const injector = useService("injector");
//   const debugService = injector.get(debugServiceType);
//   debugService();

//   const debugService2 = useService(debugServiceType);
//   debugService2();
// }
