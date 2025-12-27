export function escapeEnvValue(value: string): string {
  return value.replace(/"/g, '\\"');
}

export function unescapeQuotedValue(value: string): string {
  if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length > 1) {
    return value.slice(1, -1).replace(/\\'/g, "'");
  }
  return value;
}

