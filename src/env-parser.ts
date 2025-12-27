import { unescapeQuotedValue } from "./utils/env-value-utils";
import type { EnvVariable, ParsedEnv } from "./types";

export type { EnvVariable, ParsedEnv };

function parseVariableLine(line: string): { key: string; value: string } | null {
  const match = line.match(/^([^=#]*?)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = unescapeQuotedValue(match[2].trim());
    return { key, value };
  }
  return null;
}

export function parseEnvFile(content: string): ParsedEnv {
  const lines = content.split(/\r?\n/);
  const variables: EnvVariable[] = [];
  let pendingComments: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      continue;
    }

    if (trimmed.startsWith("#")) {
      pendingComments.push(line);
      continue;
    }

    const variable = parseVariableLine(trimmed);
    if (variable) {
      const envVariable: EnvVariable = {
        key: variable.key,
        value: variable.value,
      };
      if (pendingComments.length > 0) {
        envVariable.precedingComments = pendingComments;
      }
      variables.push(envVariable);
      pendingComments = [];
    } else {
      pendingComments = [];
    }
  }

  return { variables };
}
