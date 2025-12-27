export interface EnvVariable {
  key: string;
  value: string;
  precedingComments?: string[];
}

export interface ParsedEnv {
  variables: EnvVariable[];
}

