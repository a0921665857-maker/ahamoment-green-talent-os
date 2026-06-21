// throwaway: verify both model IDs actually resolve at the Anthropic API
import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from '@/lib/constants';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

async function ping(model: string) {
  try {
    const m = await client.messages.create({
      model,
      max_tokens: 8,
      messages: [{ role: 'user', content: 'say OK' }],
    });
    const text = m.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    console.log(`OK  ${model} -> ${JSON.stringify(text)} (stop=${m.stop_reason})`);
  } catch (e: any) {
    console.log(`FAIL ${model} -> ${e?.status ?? ''} ${e?.message ?? e}`);
  }
}

(async () => {
  await ping(MODELS.cheap);
  await ping(MODELS.quality);
})();
