/**
 * Controlled vocabularies with stable slugs + bilingual labels.
 * This file IS the talent-graph seed (TALENT_GRAPH_SCHEMA.md).
 * Slugs are permanent identifiers: never rename, only add.
 * Unmapped terms land in extracted_profiles.green_economy.free_text —
 * review monthly to grow this file (MAINTENANCE_GUIDE.md).
 */

export interface TaxonomyTerm {
  slug: string;
  label_en: string;
  label_zh: string;
}

export const sectors: TaxonomyTerm[] = [
  { slug: 'carbon-markets', label_en: 'Carbon markets', label_zh: '碳市場' },
  { slug: 'esg-advisory', label_en: 'ESG advisory', label_zh: 'ESG 顧問' },
  { slug: 'corporate-sustainability', label_en: 'Corporate sustainability', label_zh: '企業永續' },
  { slug: 'green-finance', label_en: 'Green finance', label_zh: '綠色金融' },
  { slug: 'impact-investing', label_en: 'Impact investing', label_zh: '影響力投資' },
  { slug: 'climate-tech', label_en: 'Climate tech', label_zh: '氣候科技' },
  { slug: 'renewable-energy', label_en: 'Renewable energy', label_zh: '再生能源' },
  { slug: 'sustainable-supply-chain', label_en: 'Sustainable supply chain', label_zh: '永續供應鏈' },
  { slug: 'climate-policy', label_en: 'Climate policy', label_zh: '氣候政策' },
  { slug: 'nature-biodiversity', label_en: 'Nature & biodiversity', label_zh: '自然與生物多樣性' },
  { slug: 'esg-data-ratings', label_en: 'ESG data & ratings', label_zh: 'ESG 數據與評級' },
  { slug: 'sustainability-saas', label_en: 'Sustainability SaaS', label_zh: '永續軟體服務' },
  { slug: 'circular-economy', label_en: 'Circular economy', label_zh: '循環經濟' },
  { slug: 'energy-transition', label_en: 'Energy transition', label_zh: '能源轉型' },
  { slug: 'climate-risk', label_en: 'Climate risk', label_zh: '氣候風險' },
];

export const functions: TaxonomyTerm[] = [
  { slug: 'consulting', label_en: 'Consulting', label_zh: '顧問' },
  { slug: 'customer-success', label_en: 'Customer success', label_zh: '客戶成功' },
  { slug: 'sales-bd', label_en: 'Sales & business development', label_zh: '業務與商務開發' },
  { slug: 'product', label_en: 'Product', label_zh: '產品' },
  { slug: 'strategy', label_en: 'Strategy', label_zh: '策略' },
  { slug: 'finance-investment', label_en: 'Finance & investment', label_zh: '財務與投資' },
  { slug: 'operations', label_en: 'Operations', label_zh: '營運' },
  { slug: 'policy-regulatory', label_en: 'Policy & regulatory', label_zh: '政策與法規' },
  { slug: 'research-analytics', label_en: 'Research & analytics', label_zh: '研究與分析' },
  { slug: 'marketing-comms', label_en: 'Marketing & communications', label_zh: '行銷與傳播' },
  { slug: 'engineering-technical', label_en: 'Engineering & technical', label_zh: '工程與技術' },
  { slug: 'founder-gm', label_en: 'Founder / GM', label_zh: '創辦人／總經理' },
];

export const domains: TaxonomyTerm[] = [
  { slug: 'sbti', label_en: 'SBTi target setting', label_zh: 'SBTi 目標設定' },
  { slug: 'ghg-scope123', label_en: 'GHG Scope 1–3 accounting', label_zh: '溫室氣體範疇一至三盤查' },
  { slug: 'cbam', label_en: 'CBAM', label_zh: '碳邊境調整機制（CBAM）' },
  { slug: 'tcfd', label_en: 'TCFD', label_zh: 'TCFD 氣候相關財務揭露' },
  { slug: 'tnfd', label_en: 'TNFD', label_zh: 'TNFD 自然相關財務揭露' },
  { slug: 'csrd', label_en: 'CSRD', label_zh: '歐盟企業永續報導指令（CSRD）' },
  { slug: 'gri', label_en: 'GRI reporting', label_zh: 'GRI 永續報告' },
  { slug: 'sasb', label_en: 'SASB', label_zh: 'SASB 準則' },
  { slug: 'vcm', label_en: 'Voluntary carbon markets', label_zh: '自願性碳市場' },
  { slug: 'article-6', label_en: 'Article 6', label_zh: '巴黎協定第六條' },
  { slug: 'corsia', label_en: 'CORSIA', label_zh: '國際航空碳抵換（CORSIA）' },
  { slug: 'lca', label_en: 'Life-cycle assessment', label_zh: '生命週期評估（LCA）' },
  { slug: 'renewable-ppa', label_en: 'Renewable PPAs', label_zh: '再生能源購售電合約（PPA）' },
  { slug: 'carbon-accounting', label_en: 'Carbon accounting', label_zh: '碳會計' },
  { slug: 'esg-reporting', label_en: 'ESG reporting', label_zh: 'ESG 報告' },
  { slug: 'due-diligence', label_en: 'Due diligence', label_zh: '盡職調查' },
  { slug: 'green-bonds', label_en: 'Green bonds', label_zh: '綠色債券' },
  { slug: 'blue-carbon', label_en: 'Blue carbon', label_zh: '藍碳' },
  { slug: 'reforestation', label_en: 'Reforestation', label_zh: '再造林' },
  { slug: 'cookstoves', label_en: 'Clean cookstoves', label_zh: '潔淨爐灶' },
];

export const credentials: TaxonomyTerm[] = [
  { slug: 'mba', label_en: 'MBA', label_zh: 'MBA' },
  { slug: 'cfa', label_en: 'CFA', label_zh: 'CFA' },
  { slug: 'gri-certified', label_en: 'GRI certified', label_zh: 'GRI 認證' },
  { slug: 'sasb-fsa', label_en: 'SASB FSA', label_zh: 'SASB FSA 證照' },
  { slug: 'pmp', label_en: 'PMP', label_zh: 'PMP' },
  { slug: 'cpa', label_en: 'CPA', label_zh: '會計師（CPA）' },
  { slug: 'leed', label_en: 'LEED AP', label_zh: 'LEED 認證' },
];

export const taxonomy = { sectors, functions, domains, credentials } as const;
export type TaxonomyGroup = keyof typeof taxonomy;

const slugSets: Record<TaxonomyGroup, Set<string>> = {
  sectors: new Set(sectors.map((t) => t.slug)),
  functions: new Set(functions.map((t) => t.slug)),
  domains: new Set(domains.map((t) => t.slug)),
  credentials: new Set(credentials.map((t) => t.slug)),
};

export function isKnownSlug(group: TaxonomyGroup, slug: string): boolean {
  return slugSets[group].has(slug);
}

/** Split a slug list into known slugs and free-text leftovers (extraction post-processing). */
export function partitionSlugs(group: TaxonomyGroup, values: string[]): { known: string[]; unknown: string[] } {
  const known: string[] = [];
  const unknown: string[] = [];
  for (const v of values) (isKnownSlug(group, v) ? known : unknown).push(v);
  return { known, unknown };
}

export function labelFor(group: TaxonomyGroup, slug: string, locale: 'en' | 'zh-TW'): string {
  let term = taxonomy[group].find((t) => t.slug === slug);
  if (!term) {
    // The extractor sometimes files a known slug under the wrong group
    // (walkthrough F5: sector slug in domains rendered raw). Any known label
    // beats leaking a slug into the UI.
    for (const g of Object.keys(taxonomy) as TaxonomyGroup[]) {
      term = taxonomy[g].find((t) => t.slug === slug);
      if (term) break;
    }
  }
  if (!term) return slug;
  return locale === 'zh-TW' ? term.label_zh : term.label_en;
}

/** Extraction post-processing (walkthrough F5): re-home known slugs the model
 * filed under the wrong group, and move truly unknown values into free_text so
 * the monthly taxonomy review (MAINTENANCE_GUIDE) actually receives them. */
export function normalizeGreenEconomy<T extends {
  sectors: string[];
  functions: string[];
  domains: string[];
  free_text: string[];
}>(ge: T): T {
  const groups = ['sectors', 'functions', 'domains'] as const;
  const out: Record<(typeof groups)[number], string[]> = { sectors: [], functions: [], domains: [] };
  const freeText = [...ge.free_text];
  for (const from of groups) {
    for (const slug of ge[from]) {
      if (isKnownSlug(from, slug)) {
        if (!out[from].includes(slug)) out[from].push(slug);
        continue;
      }
      const home = groups.find((g) => isKnownSlug(g, slug));
      if (home) {
        if (!out[home].includes(slug)) out[home].push(slug);
      } else if (!freeText.includes(slug)) {
        freeText.push(slug);
      }
    }
  }
  return { ...ge, sectors: out.sectors, functions: out.functions, domains: out.domains, free_text: freeText };
}

/** Slug lists formatted for injection into the extraction prompt. */
export function slugListsForPrompt(): string {
  return [
    `sectors: ${sectors.map((t) => t.slug).join(', ')}`,
    `functions: ${functions.map((t) => t.slug).join(', ')}`,
    `domains: ${domains.map((t) => t.slug).join(', ')}`,
    `credentials: ${credentials.map((t) => t.slug).join(', ')}`,
  ].join('\n');
}
