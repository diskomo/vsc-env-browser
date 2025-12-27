export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function isValidVariableIndex(
  index: number,
  variablesLength: number
): boolean {
  return index >= 0 && index < variablesLength;
}

