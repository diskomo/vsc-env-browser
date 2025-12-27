import type { ParsedEnv } from "./types";
import { escapeEnvValue } from "./utils/env-value-utils";

export function formatEnvFile(parsed: ParsedEnv): string {
  if (!parsed || !parsed.variables) {
    throw new Error("Invalid parsed environment data");
  }

  const lines: string[] = [];

  for (const variable of parsed.variables) {
    if (!variable || typeof variable.key !== "string") {
      continue;
    }
    if (variable.precedingComments && variable.precedingComments.length > 0) {
      for (const comment of variable.precedingComments) {
        lines.push(comment);
      }
    }
    const escapedValue = escapeEnvValue(variable.value || "");
    lines.push(`${variable.key}="${escapedValue}"`);
  }

  return lines.join("\n");
}
