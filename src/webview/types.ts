export interface EnvVariable {
  key: string;
  value: string;
  precedingComments?: string[];
}

export interface ParsedEnv {
  variables: EnvVariable[];
}

export type WebviewMessage =
  | { type: "update"; data: ParsedEnv }
  | { type: "copy"; value: string }
  | { type: "save"; parsed: ParsedEnv }
  | { type: "toggleView" }
  | { type: "log"; level: "log" | "warn" | "error"; message: string; args?: unknown[] };

export type ExtensionMessage =
  | { type: "update"; data: ParsedEnv }
  | { type: "copy"; value: string }
  | { type: "save"; parsed: ParsedEnv }
  | { type: "toggleView" };

