import type { EnvVariable } from "../types";
import { escapeHtml } from "./dom-utils";

export function renderVariableTable(variables: EnvVariable[]): string {
  let html = `<table class="env-table">`;
  html += `
    <thead>
      <tr>
        <th class="drag-header"></th>
        <th>Name</th>
        <th>Value</th>
        <th class="actions-header"></th>
      </tr>
    </thead>
    <tbody>
  `;

  for (let index = 0; index < variables.length; index++) {
    const variable = variables[index];
    html += `
      <tr 
        class="variable-row" 
        draggable="true"
        data-variable-index="${index}"
      >
        <td class="drag-handle" title="Drag to reorder">
          <svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="4" r="1.5"/>
            <circle cx="12" cy="4" r="1.5"/>
            <circle cx="4" cy="8" r="1.5"/>
            <circle cx="12" cy="8" r="1.5"/>
            <circle cx="4" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
          </svg>
        </td>
        <td class="key-cell">
          <input 
            type="text" 
            class="key-input" 
            value="${escapeHtml(variable.key)}"
            data-variable-index="${index}"
            data-action="update-key"
          />
        </td>
        <td class="value-cell">
          <input 
            type="text" 
            class="value-input" 
            value="${escapeHtml(variable.value)}"
            data-variable-index="${index}"
            data-action="update-value"
          />
        </td>
        <td class="actions-cell">
          <div class="action-buttons">
            <button 
              class="icon-button copy-button" 
              data-action="copy"
              data-variable-index="${index}"
              title="Copy value to clipboard"
            >
              <svg class="icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 2A1.5 1.5 0 0 0 4 3.5v9A1.5 1.5 0 0 0 5.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 1h-7zM5 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-9z"/>
                <path d="M2.5 4h-1A1.5 1.5 0 0 0 0 5.5v9A1.5 1.5 0 0 0 1.5 16h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1a.5.5 0 0 0 0-1z"/>
              </svg>
            </button>
            <button 
              class="icon-button delete-button" 
              data-action="delete"
              data-variable-index="${index}"
              title="Delete variable"
            >
              <svg class="icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84L13.962 3.5H14.5a.5.5 0 0 0 0-1h-1.006a.58.58 0 0 0-.01 0H11ZM4.118 3.5 3.5 13.826a1 1 0 0 1 .997.924h6.23a1 1 0 0 1 .997-.924L11.882 3.5H4.118Z"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  html += "</tbody></table>";
  return html;
}

