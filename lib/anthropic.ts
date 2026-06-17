import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { PromptDef } from './prompts/types';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing.');
  client = new Anthropic({ apiKey });
  return client;
}

/** Thrown after a failed repair retry. Callers map this to their degraded path. */
export class PromptValidationError extends Error {
  constructor(
    public promptId: string,
    public issues: string,
    public lastRaw: string,
  ) {
    super(`Prompt ${promptId} failed validation after repair: ${issues}`);
    this.name = 'PromptValidationError';
  }
}

function validate<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
): { ok: true; data: z.infer<S> } | { ok: false; issues: string } {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
  };
}

/**
 * Anthropic tool input_schema must be a JSON-Schema object. We derive it from the
 * prompt's zod schema so the MODEL is told the exact shape it must produce (key
 * names, nesting, enums) instead of guessing from prose — the root cause of
 * structure drift. Cached per schema object.
 */
const schemaCache = new WeakMap<object, Anthropic.Tool.InputSchema>();
function toolInputSchema(schema: z.ZodTypeAny): Anthropic.Tool.InputSchema {
  const cached = schemaCache.get(schema);
  if (cached) return cached;
  const js = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }) as Record<
    string,
    unknown
  >;
  delete js.$schema; // Anthropic ignores it; drop to keep the payload clean
  const input = js as Anthropic.Tool.InputSchema;
  schemaCache.set(schema, input);
  return input;
}

function firstToolUse(message: Anthropic.Message): Anthropic.ToolUseBlock | null {
  for (const block of message.content) if (block.type === 'tool_use') return block;
  return null;
}

export interface CallOptions {
  /** Base64 PDF, sent as an Anthropic document block (extraction path only). */
  pdfBase64?: string;
}

/**
 * Run a prompt as a forced tool call so the model returns structured arguments
 * matching the prompt's zod schema, then validate. On failure, do exactly one
 * repair retry that feeds the validation errors back via a tool_result. A second
 * failure throws PromptValidationError so the caller can take its degraded path
 * (ARCHITECTURE.md error pattern).
 */
export async function callPrompt<I, S extends z.ZodTypeAny>(
  prompt: PromptDef<I, S>,
  input: I,
  opts: CallOptions = {},
): Promise<z.infer<S>> {
  const userText = prompt.build(input);
  const firstContent: Anthropic.ContentBlockParam[] = [];
  if (opts.pdfBase64) {
    firstContent.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: opts.pdfBase64 },
    });
  }
  firstContent.push({ type: 'text', text: userText });

  const toolName = `emit_${prompt.id}`;
  const tool: Anthropic.Tool = {
    name: toolName,
    description: 'Return the result as structured arguments conforming exactly to the schema.',
    input_schema: toolInputSchema(prompt.outputSchema),
  };

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: firstContent }];
  let lastRaw = '';
  let lastIssues = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await getClient().messages.create({
      model: prompt.model,
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      system: prompt.system,
      messages,
      tools: [tool],
      tool_choice: { type: 'tool', name: toolName },
    });

    const toolUse = firstToolUse(message);
    if (!toolUse) {
      lastIssues = 'model returned no tool_use block';
      lastRaw = JSON.stringify(message.content);
      break;
    }
    lastRaw = JSON.stringify(toolUse.input);
    const check = validate(prompt.outputSchema, toolUse.input);
    if (check.ok) return check.data;

    lastIssues = check.issues;
    messages.push({ role: 'assistant', content: message.content });
    messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          is_error: true,
          content: `Your arguments failed validation: ${check.issues}. Call ${toolName} again with corrected arguments that conform exactly to the schema.`,
        },
      ],
    });
  }

  throw new PromptValidationError(prompt.id, lastIssues, lastRaw);
}
