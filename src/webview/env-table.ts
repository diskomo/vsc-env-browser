import type { ParsedEnv, ExtensionMessage } from "./types";
import {
  createDragHandlers,
  attachDragListeners,
  type DragState,
} from "./utils/drag-handlers";
import { renderVariableTable } from "./utils/table-renderer";
import {
  createMessageHandlers,
  attachMessageHandlersToWindow,
  type MessageHandlersState,
} from "./utils/message-handlers";
import { attachEventDelegation } from "./utils/event-delegation";
import { webviewLogger } from "./utils/logger";

webviewLogger.log("[Webview] Initializing...");

const vscode = (window as any).vscode;
if (!vscode) {
  throw new Error("VS Code API not available. Make sure the webview is properly initialized.");
}
webviewLogger.log("[Webview] VS Code API acquired");

let currentParsed: ParsedEnv = { variables: [] };
const dragState: DragState = {
  draggedElement: null,
  draggedIndex: null,
};
let shouldFocusNewVariable = false;
let dragHandlers: ReturnType<typeof createDragHandlers>;
let messageHandlers: ReturnType<typeof createMessageHandlers>;

const messageHandlersState: MessageHandlersState = {
  getCurrentParsed: () => currentParsed,
  setCurrentParsed: (value: ParsedEnv) => {
    currentParsed = value;
  },
  getShouldFocusNewVariable: () => shouldFocusNewVariable,
  setShouldFocusNewVariable: (value: boolean) => {
    shouldFocusNewVariable = value;
  },
  postMessage: (message) => {
    vscode.postMessage(message);
  },
};

messageHandlers = createMessageHandlers(messageHandlersState);
attachMessageHandlersToWindow(messageHandlers);

function initializeEventDelegation() {
  const app = document.getElementById("app");
  if (app) {
    attachEventDelegation(app, messageHandlers);
  }
}

if (document.readyState === "loading") {
  webviewLogger.log("[Webview] Document still loading, waiting for DOMContentLoaded");
  document.addEventListener("DOMContentLoaded", initializeEventDelegation);
} else {
  webviewLogger.log("[Webview] Document ready, initializing event delegation");
  initializeEventDelegation();
}

window.addEventListener("message", (event: MessageEvent<ExtensionMessage>) => {
  webviewLogger.log("[Webview] Received message from extension:", event.data.type);
  const message = event.data;
  switch (message.type) {
    case "update":
      webviewLogger.log("[Webview] Updating content with", message.data.variables.length, "variables");
      updateContent(message.data);
      break;
    default:
      webviewLogger.warn("[Webview] Unknown message type:", message.type);
  }
});

function updateContent(parsed: ParsedEnv) {
  webviewLogger.log("[Webview] updateContent called with", parsed.variables.length, "variables");
  const content = document.getElementById("content");
  if (!content) {
    webviewLogger.error("[Webview] Content element not found!");
    return;
  }
  webviewLogger.log("[Webview] Content element found");

  currentParsed = parsed;

  let html = `
    <div class="header-bar">
      <button class="add-button" data-action="add">+ Add Variable</button>
      <button class="toggle-button" data-action="toggle" title="Switch to raw text editor">
        Show plain text
      </button>
    </div>
    <div class="table-container">
  `;

  if (parsed.variables.length > 0) {
    html += renderVariableTable(parsed.variables);
  }

  html += "</div>";

  content.innerHTML = html;
  webviewLogger.log("[Webview] Content HTML updated, length:", html.length);
  
  const rows = document.querySelectorAll<HTMLElement>(".variable-row");
  webviewLogger.log("[Webview] Found", rows.length, "variable rows");
  dragHandlers = createDragHandlers(dragState, messageHandlers.reorderVariable);
  attachDragListeners(rows, dragHandlers);

  if (shouldFocusNewVariable) {
    shouldFocusNewVariable = false;
    setTimeout(() => {
      const firstKeyInput = document.querySelector<HTMLInputElement>(".key-input");
      if (firstKeyInput) {
        firstKeyInput.focus();
      }
    }, 0);
  }
}
