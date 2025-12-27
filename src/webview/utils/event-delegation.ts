import type { createMessageHandlers } from "./message-handlers";
import { webviewLogger } from "./logger";

export function attachEventDelegation(
  container: HTMLElement,
  handlers: ReturnType<typeof createMessageHandlers>
) {
  webviewLogger.log("[Webview] Attaching event delegation to container");
  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest("button[data-action]") as HTMLElement | null;
    if (!button) return;

    const action = button.dataset.action;
    const variableIndexStr = button.dataset.variableIndex;
    if (!variableIndexStr) return;

    const variableIndex = Number.parseInt(variableIndexStr, 10);
    webviewLogger.log("[Webview] Button clicked:", action, "variableIndex:", variableIndex);

    switch (action) {
      case "copy":
        handlers.copyValue(variableIndex);
        break;
      case "delete":
        handlers.deleteVariable(variableIndex);
        break;
    }
  });

  container.addEventListener("change", (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches("input[data-action]")) return;

    const action = target.dataset.action;
    const variableIndexStr = target.dataset.variableIndex;
    if (!variableIndexStr) return;

    const variableIndex = Number.parseInt(variableIndexStr, 10);

    if (target instanceof HTMLInputElement) {
      switch (action) {
        case "update-key":
          handlers.updateKey(variableIndex, target.value);
          break;
        case "update-value":
          handlers.updateValue(variableIndex, target.value);
          break;
      }
    }
  });

  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest(
      "button[data-action='add'], button[data-action='toggle']"
    ) as HTMLElement | null;
    if (!button) return;

    const action = button.dataset.action;
    switch (action) {
      case "add":
        handlers.addVariable();
        break;
      case "toggle":
        handlers.toggleView();
        break;
    }
  });
}
