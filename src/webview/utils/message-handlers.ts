import type { ParsedEnv, WebviewMessage } from "../types";
import { isValidVariableIndex } from "./dom-utils";
import { webviewLogger } from "./logger";

export interface MessageHandlersState {
  getCurrentParsed: () => ParsedEnv;
  setCurrentParsed: (parsed: ParsedEnv) => void;
  getShouldFocusNewVariable: () => boolean;
  setShouldFocusNewVariable: (value: boolean) => void;
  postMessage: (message: WebviewMessage) => void;
}

export function createMessageHandlers(state: MessageHandlersState) {
  function updateValue(variableIndex: number, newValue: string) {
    const currentParsed = state.getCurrentParsed();
    const variables = currentParsed.variables;

    if (isValidVariableIndex(variableIndex, variables.length)) {
      variables[variableIndex].value = newValue;
      saveVariables();
    }
  }

  function updateKey(variableIndex: number, newKey: string) {
    const currentParsed = state.getCurrentParsed();
    const variables = currentParsed.variables;

    if (isValidVariableIndex(variableIndex, variables.length)) {
      variables[variableIndex].key = newKey;
      saveVariables();
    }
  }

  function copyValue(variableIndex: number) {
    const currentParsed = state.getCurrentParsed();
    const variables = currentParsed.variables;

    if (isValidVariableIndex(variableIndex, variables.length)) {
      const value = variables[variableIndex].value;
      state.postMessage({
        type: "copy",
        value: value,
      });
    }
  }

  function deleteVariable(variableIndex: number) {
    const currentParsed = state.getCurrentParsed();
    const variables = currentParsed.variables;

    if (isValidVariableIndex(variableIndex, variables.length)) {
      variables.splice(variableIndex, 1);
      saveVariables();
    }
  }

  function addVariable() {
    const currentParsed = state.getCurrentParsed();
    currentParsed.variables.unshift({ key: "", value: "" });
    state.setShouldFocusNewVariable(true);
    saveVariables();
  }

  function toggleView() {
    state.postMessage({
      type: "toggleView",
    });
  }

  function saveVariables() {
    const currentParsed = state.getCurrentParsed();
    webviewLogger.log("[Webview] Saving variables:", currentParsed.variables.length);
    state.postMessage({
      type: "save",
      parsed: currentParsed,
    });
  }

  function reorderVariable(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;

    const currentParsed = state.getCurrentParsed();
    const variables = currentParsed.variables;
    if (fromIndex < 0 || fromIndex >= variables.length) return;
    if (toIndex < 0 || toIndex > variables.length) return;

    const [moved] = variables.splice(fromIndex, 1);

    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    variables.splice(adjustedToIndex, 0, moved);

    saveVariables();
  }

  return {
    updateValue,
    updateKey,
    copyValue,
    deleteVariable,
    addVariable,
    toggleView,
    reorderVariable,
  };
}

export function attachMessageHandlersToWindow(handlers: ReturnType<typeof createMessageHandlers>) {
  const windowWithFunctions = window as {
    updateValue?: typeof handlers.updateValue;
    updateKey?: typeof handlers.updateKey;
    copyValue?: typeof handlers.copyValue;
    deleteVariable?: typeof handlers.deleteVariable;
    addVariable?: typeof handlers.addVariable;
    toggleView?: typeof handlers.toggleView;
  };

  windowWithFunctions.updateValue = handlers.updateValue;
  windowWithFunctions.updateKey = handlers.updateKey;
  windowWithFunctions.copyValue = handlers.copyValue;
  windowWithFunctions.deleteVariable = handlers.deleteVariable;
  windowWithFunctions.addVariable = handlers.addVariable;
  windowWithFunctions.toggleView = handlers.toggleView;
}
