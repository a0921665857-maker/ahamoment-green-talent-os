// throwaway probe: confirm env + model IDs load, no network
const k = process.env.ANTHROPIC_API_KEY;
const sb = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log('ANTHROPIC_API_KEY present:', !!k, k ? `len=${k.length} prefix=${k.slice(0, 7)}` : '');
console.log('SUPABASE present:', !!sb);
import('@/lib/constants').then((m) => {
  console.log('MODELS:', JSON.stringify(m.MODELS));
});
