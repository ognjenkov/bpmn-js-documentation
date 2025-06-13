export const debugServiceType = "debugService";

export function DebugService(injector) {
  console.log("[Available services]", Object.keys(injector._providers).length);
}

DebugService.$inject = ["injector"];
