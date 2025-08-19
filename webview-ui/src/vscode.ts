declare global {
  interface Window {
    acquireVsCodeApi(): {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

// Safely acquire the VS Code API exactly once
let vscodeApi: ReturnType<typeof window.acquireVsCodeApi> | undefined;

export function getVSCodeAPI() {
  if (!vscodeApi) {
    vscodeApi = window.acquireVsCodeApi();
  }
  return vscodeApi;
}

export default getVSCodeAPI;
