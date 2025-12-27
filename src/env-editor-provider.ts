import * as vscode from "vscode";
import { parseEnvFile } from "./env-parser";
import { formatEnvFile } from "./env-formatter";
import { replaceDocumentContent } from "./utils/document-utils";
import { logger } from "./utils/logger";

export class EnvEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EnvEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      "envBrowser.envEditor",
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    );
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    logger.log("[EnvEditor] Resolving custom editor for:", document.uri.toString());
    
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "out", "webview")],
    };

    const updateWebview = () => {
      try {
        const text = document.getText();
        logger.log("[EnvEditor] Updating webview, document length:", text.length);
        const parsed = parseEnvFile(text);
        logger.log("[EnvEditor] Parsed variables:", parsed.variables.length);
        webviewPanel.webview.postMessage({
          type: "update",
          data: parsed,
        });
        logger.log("[EnvEditor] Posted update message to webview");
      } catch (error) {
        logger.error("[EnvEditor] Error updating webview", error);
        vscode.window.showErrorMessage(
          `Failed to parse .env file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    const saveListener = vscode.workspace.onWillSaveTextDocument(async (e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        try {
          const text = document.getText();
          const parsed = parseEnvFile(text);
          const formatted = formatEnvFile(parsed);
          if (formatted !== text) {
            const edit = replaceDocumentContent(document, formatted);
            await vscode.workspace.applyEdit(edit);
          }
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to format .env file: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      saveListener.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      logger.log("[EnvEditor] Received message from webview:", message.type);
      try {
        switch (message.type) {
          case "log": {
            const logMessage = `[Webview] ${message.message}`;
            if (message.level === "error") {
              logger.error(logMessage, ...(message.args || []));
            } else if (message.level === "warn") {
              logger.log(`WARN: ${logMessage}`, ...(message.args || []));
            } else {
              logger.log(logMessage, ...(message.args || []));
            }
            break;
          }
          case "copy":
            await vscode.env.clipboard.writeText(message.value);
            vscode.window.showInformationMessage("Value copied to clipboard");
            break;
          case "save": {
            logger.log("[EnvEditor] Saving document with", message.parsed.variables.length, "variables");
            const formatted = formatEnvFile(message.parsed);
            const edit = replaceDocumentContent(document, formatted);
            await vscode.workspace.applyEdit(edit);
            break;
          }
          case "toggleView": {
            webviewPanel.dispose();
            await vscode.window.showTextDocument(document.uri);
            break;
          }
        }
      } catch (error) {
        logger.error("[EnvEditor] Error handling message", error);
        vscode.window.showErrorMessage(
          `Operation failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    const html = this.getHtmlForWebview(webviewPanel.webview);
    const scriptUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "webview", "env-table.js")
    );
    logger.log("[EnvEditor] Setting webview HTML, script URI:", scriptUri.toString());
    webviewPanel.webview.html = html;

    updateWebview();
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "webview", "env-table.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "webview", "envTable.css")
    );

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
    <title>Env Browser</title>
    <link rel="stylesheet" href="${styleUri}" />
  </head>
  <body>
    <div id="app">
      <div id="content"></div>
    </div>
    <script>
      window.vscode = acquireVsCodeApi();
      const webviewLogger = {
        error: (message, ...args) => {
          console.error(message, ...args);
          try {
            window.vscode.postMessage({ type: 'log', level: 'error', message, args: args.length > 0 ? args : undefined });
          } catch (e) {}
        }
      };
      window.addEventListener('error', (e) => {
        webviewLogger.error('[Webview] Script error:', e.message, e.filename, e.lineno);
      });
      window.addEventListener('unhandledrejection', (e) => {
        webviewLogger.error('[Webview] Unhandled promise rejection:', e.reason);
      });
    </script>
    <script type="module" src="${scriptUri}" onerror="webviewLogger.error('[Webview] Failed to load script:', '${scriptUri}')"></script>
  </body>
</html>`;
  }
}
