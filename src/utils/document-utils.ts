import * as vscode from "vscode";

export function replaceDocumentContent(
  document: vscode.TextDocument,
  content: string
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit();
  edit.replace(
    document.uri,
    new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    ),
    content
  );
  return edit;
}

