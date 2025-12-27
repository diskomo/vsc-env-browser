function getVscodeApi() {
  const vscode = (window as any).vscode;
  if (!vscode) {
    throw new Error("VS Code API not available. Make sure the webview is properly initialized.");
  }
  return vscode;
}

export const webviewLogger = {
  log: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args);
    try {
      getVscodeApi().postMessage({
        type: "log",
        level: "log",
        message,
        args: args.length > 0 ? args : undefined,
      });
    } catch (e) {
      console.error("[Webview Logger] Failed to send log:", e);
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(message, ...args);
    try {
      getVscodeApi().postMessage({
        type: "log",
        level: "warn",
        message,
        args: args.length > 0 ? args : undefined,
      });
    } catch (e) {
      console.error("[Webview Logger] Failed to send log:", e);
    }
  },
  error: (message: string, error?: unknown): void => {
    console.error(message, error);
    try {
      getVscodeApi().postMessage({
        type: "log",
        level: "error",
        message,
        args: error ? [error] : undefined,
      });
    } catch (e) {
      console.error("[Webview Logger] Failed to send log:", e);
    }
  },
};

