import type { z } from 'zod';

/** Common shape for every prompt (PROMPT_LIBRARY.md convention). */
export interface PromptDef<TInput, TSchema extends z.ZodTypeAny> {
  id: string;
  version: string;
  model: string;
  temperature: number;
  maxTokens: number;
  /** System instructions — stable, no user PII. */
  system: string;
  /** Builds the user-turn content from typed input. JSON-only output is required. */
  build: (input: TInput) => string;
  outputSchema: TSchema;
}
