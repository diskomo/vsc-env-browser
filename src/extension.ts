import * as vscode from "vscode";
import { EnvEditorProvider } from "./env-editor-provider";
import { logger } from "./utils/logger";

export function activate(context: vscode.ExtensionContext) {
  logger.log("Env Browser extension activating...");
  logger.show();

  context.subscriptions.push(EnvEditorProvider.register(context));

  const toggleViewCommand = vscode.commands.registerCommand("envBrowser.toggleView", async () => {
    logger.log("Toggle view command executed");
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
    const activeEditor = vscode.window.activeTextEditor;
    
    let uri: vscode.Uri | undefined;
    let isInWebview = false;
    
    if (activeTab?.input instanceof vscode.TabInputCustom && activeTab.input.viewType === "envBrowser.envEditor") {
      uri = activeTab.input.uri;
      isInWebview = true;
    } else if (activeEditor && activeEditor.document.fileName.match(/\.env/)) {
      uri = activeEditor.document.uri;
      isInWebview = false;
    }
    
    if (!uri) {
      vscode.window.showWarningMessage("Please open a .env file to toggle views");
      return;
    }
    
    if (isInWebview) {
      await vscode.window.showTextDocument(uri);
    } else {
      await vscode.commands.executeCommand(
        "vscode.openWith",
        uri,
        "envBrowser.envEditor"
      );
    }
  });

  context.subscriptions.push(toggleViewCommand);
  logger.log("Env Browser extension activated");
}

export function deactivate() {}
