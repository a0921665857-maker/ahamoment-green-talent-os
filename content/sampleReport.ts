import type { Bands, ReportSections } from '@/lib/types';
import type { Locale, OfferId, ResultCategory } from '@/lib/constants';

/**
 * A public, representative MRI sample shown as proof before the email gate.
 * Persona: a senior Big-4 ESG/sustainability consultant in Taiwan, considering an
 * MBA, strong on climate but with a weak through-line. Mirrors the real v2 report
 * depth. Not tied to any real person.
 */
export interface SampleReport {
  name: string | null;
  category: ResultCategory;
  primaryOffer: OfferId;
  secondaryOffer: OfferId | null;
  limitedData: boolean;
  bands: Bands;
  sections: ReportSections['sections'];
}

const bands: Bands = {
  story_index: 'developing',
  mba_index: 'developing',
  climate_index: 'strong',
  commercial_credibility: 'developing',
  international_positioning: 'developing',
  interview_readiness: 'developing',
  cv_readiness: 'developing',
  green_economy_fit: 'strong',
  mba_readiness: 'developing',
};

export const sampleReports: Record<Locale, SampleReport> = {
  'zh-TW': {
    name: null,
    category: 'climate_career_first_mba_later',
    primaryOffer: 'climate_positioning_sprint',
    secondaryOffer: 'teardown_90',
    limitedData: false,
    bands,
    sections: {
      current_positioning: {
        body: '你目前的定位，是一位在台灣上市製造業 ESG 合規服務裡深耕 6 年、技術框架最完整的資深顧問之一。招募者或招生官在六秒內看到的是一個紮實的四大 ESG 執行專家——熟悉 GRI、SASB、SBTi、TCFD、CBAM，帶過小型專案團隊。這個輪廓清楚可信，但邊界也很明確：它讀起來像「做得很好的顧問」，而不是「對某件事有獨到判斷的氣候思考者」。你說「說不太清楚下一步要往哪走」，洩露了關鍵落差——你用框架清單描述自己，而不是用一個觀點。招募者看到清單會把你歸到執行層；看到觀點才會歸到策略層。',
        evidence_ref: '主要負責企業 ESG 報告書、SASB 與 GRI 導入，也帶過 SBTi 專案；「說不太清楚下一步要往哪走」',
      },
      hidden_strengths: {
        body: '你有三個被自己低估的強項。一是「製造業 ESG 的跨框架整合」——同時操作 GRI、SASB、SBTi、TCFD、CBAM 的顧問在台灣並不多，而製造業正是全球 Scope 3 壓力最集中的地方。二是你「最近開始接觸 TCFD 與 CBAM」這件事本身：這兩個框架正是台灣企業最焦慮的合規前沿，你在這個時間點切入，代表你的知識邊界正往氣候風險與財務揭露移動。三是專案層級的帶人經驗——在交付壓力與框架快速演變下協調知識工作，是氣候顧問與 ESG 基金都需要的能力。',
        evidence_ref: 'GRI/SASB/SBTi/TCFD/CBAM；「最近開始接觸」TCFD 與 CBAM；「比較像專案層級的帶人」',
      },
      underused_story_assets: {
        body: '有兩個資產目前幾乎被埋著。第一是「SBTi 目標設定專案」：SBTi 在台灣導入案例稀少，而它涉及企業碳預算的科學設定，與氣候金融的 climate alignment 評估有直接概念連結——但在你的描述裡它只是清單上一個並列項目，讀者看不到你的判斷。第二是「你服務的是上市製造業客戶」：上市代表公開揭露壓力與董事會層級治理，你的成果要接受外部審視，這給了你「資本市場可信度」的基礎，但你只把它當背景資訊帶過。',
        evidence_ref: 'SBTi 目標設定專案；上市櫃製造業客戶',
      },
      core_story_gap: {
        body: '你最大的故事缺口，是你沒有一個屬於自己的氣候觀點。你不缺知識，但在 6 年裡幫很多企業導框架、做揭露之後，你對「台灣製造業的氣候轉型，真正的障礙在哪裡」有沒有一個願意捍衛的答案？目前是缺席的。機制是這樣：評估資深候選人時，招募者預期看到的不是「做過什麼」，而是「從這些工作形成了什麼判斷」。「說不太清楚下一步」在他們耳裡＝這個人還沒把經驗轉成觀點。這在你想往氣候金融移動時特別致命——那裡的面試核心不是「你懂哪些框架」，而是「你對氣候風險定價有什麼看法」。',
        evidence_ref: '6 年 ESG 顧問經歷；「說不太清楚下一步要往哪走」',
      },
      green_career_fit: {
        body: '從你的實際經驗看，你有一個競爭最不對稱的空間：台灣製造業供應鏈的氣候轉型顧問與評估。依據是三個同時成立的條件——你服務上市製造業（出口碳壓力最集中）、同時有 SBTi（內部減碳）與 CBAM（外部貿易碳壓力）經驗、又有 GRI/SASB 的揭露可信度。這讓你在企業氣候轉型策略、供應鏈氣候風險評估、ESG 評級分析等賽道上不需要從零開始。相較於直接跳氣候金融（需補缺口），供應鏈氣候風險是你現有能力最完整、需求又在加速的交叉點——在這裡你不必和金融背景者競爭。',
        evidence_ref: '上市製造業客戶；SBTi 與 CBAM 操作經驗；GRI/SASB 資格',
      },
      mba_readiness: {
        body: '你 MBA 申請上最關鍵的障礙不是資歷深度，而是還沒有一個清楚的「申請理由」。你說「可能 6 到 12 個月內申請，但還沒決定」——問題是 MBA 論文核心是說清楚「我要去哪、為什麼 MBA 是必要一步」，但你連目標賽道都還在探索。現在寫出來的會是一篇方向模糊的論文。',
        evidence_ref: '「可能 6 到 12 個月內申請，但還沒決定要不要」',
      },
      commercial_clarity: {
        body: '你的影響目前聽起來偏「合規完成」而非「商業價值」。你描述工作多用框架與交付物，少用對客戶決策或成本的影響——例如 SBTi 專案讓客戶的碳路徑改變了什麼、省了什麼。這讓你的商業可信度被低估。',
        evidence_ref: 'ESG 報告書與框架導入的描述方式',
      },
      international_positioning: {
        body: '你的輪廓目前偏台灣在地。CBAM 與 TCFD 是國際框架，是你少數能「外travel」的訊號，但你的經驗敘述仍以台灣客戶為主，跨區可信度尚未被點亮。',
        evidence_ref: 'CBAM／TCFD 國際框架經驗；台灣客戶為主',
      },
      interview_readiness: {
        body: '你最會卡的題型是「觀點題」——例如「你認為台灣製造業減碳最大的障礙是什麼，為什麼？」你能流暢回答框架題，但這類需要立場的題目目前還沒有準備好的答案。',
        evidence_ref: '以框架清單描述自己的傾向',
      },
      cv_readiness: {
        body: '你 CV 最大的結構問題是「用框架名稱代替成果」：每一條都是做了什麼框架，少有量化結果或你做的判斷。讀者看完知道你接觸過什麼，但不知道你因此改變了什麼。',
        evidence_ref: 'GRI/SASB/SBTi 並列的條目寫法',
      },
      recommended_next_move: {
        body: '兩週內，挑你做過最有份量的一個 SBTi 或 CBAM 專案，寫成 150 字的「觀點短文」：這個專案讓你看見台灣製造業氣候轉型的哪一個真實障礙、你的判斷是什麼。先把「觀點」這塊肌肉練起來——這是你接下來無論轉職或申請 MBA 都會反覆用到的核心。',
        evidence_ref: 'SBTi／CBAM 專案經驗',
      },
      suggested_paid_next_step: {
        body: '你的情況最適合「先把氣候職涯定位想清楚，MBA 之後再說」。氣候定位衝刺正是為此設計：用你的真實證據定下目標賽道、點名你的差異化、畫出兩步棋——而不是急著申請、把模糊帶進論文。這是這份診斷的自然延伸，不是另一個推銷。',
        evidence_ref: '考慮 MBA 但目標賽道未定',
      },
    },
  },
  en: {
    name: null,
    category: 'climate_career_first_mba_later',
    primaryOffer: 'climate_positioning_sprint',
    secondaryOffer: 'teardown_90',
    limitedData: false,
    bands,
    sections: {
      current_positioning: {
        body: 'You currently read as one of the most technically complete senior ESG consultants in Taiwan’s listed-manufacturing compliance space, with six years of depth. In six seconds a recruiter or admissions reader sees a solid Big-4 ESG operator — fluent in GRI, SASB, SBTi, TCFD, CBAM, with small-team project experience. That picture is credible, but its edges are sharp: it reads as “a consultant who does the work well,” not “a climate thinker with a point of view.” Your own line — “I can’t quite say where I go next” — reveals the gap: you describe yourself with a list of frameworks rather than a stance. Lists get filed under execution; a point of view gets filed under strategy.',
        evidence_ref: 'ESG reporting, SASB/GRI adoption, SBTi projects; “I can’t quite say where I go next”',
      },
      hidden_strengths: {
        body: 'You are underweighting three strengths. First, cross-framework integration in manufacturing ESG — few Taiwan consultants operate GRI, SASB, SBTi, TCFD and CBAM together, and manufacturing is where global Scope 3 pressure concentrates. Second, the fact that you have “recently started on” TCFD and CBAM: these are exactly the compliance frontier Taiwanese exporters are most anxious about, so your knowledge edge is moving toward climate risk and financial disclosure. Third, project-level leadership — coordinating knowledge work under delivery pressure as frameworks shift is precisely what climate advisory and ESG funds need.',
        evidence_ref: 'GRI/SASB/SBTi/TCFD/CBAM; “recently started on” TCFD and CBAM; project-level team lead',
      },
      underused_story_assets: {
        body: 'Two assets are buried. The SBTi target-setting work: SBTi adoption is still rare in Taiwan, and it ties directly to the climate-alignment assessments used in climate finance — yet in your telling it sits as one item in a list, with none of the judgment you exercised. And the fact that your clients are listed manufacturers: that means public-disclosure scrutiny and board-level governance, which gives your work capital-markets credibility — but you treat it as background, not as a signal of the standard you work to.',
        evidence_ref: 'SBTi target-setting project; listed-manufacturer clients',
      },
      core_story_gap: {
        body: 'Your single biggest gap is that you have no climate point of view of your own. You are not short on knowledge — but after six years of helping companies set targets and disclose, do you have a defensible answer to “what is the real obstacle to Taiwanese manufacturing’s climate transition?” Right now it is absent. The mechanism: evaluating a senior candidate, a recruiter expects not “what you did” but “what judgment you formed.” “I can’t say where I go next” reads as: this person hasn’t turned experience into a view. Moving toward climate finance, that is fatal — those interviews ask what you think about pricing climate risk, not which frameworks you know.',
        evidence_ref: 'six years of ESG advisory; “I can’t quite say where I go next”',
      },
      green_career_fit: {
        body: 'From your actual experience, your most asymmetric space is climate-transition advisory and assessment for Taiwan’s manufacturing supply chains. Three conditions hold at once: you serve listed manufacturers (where export carbon pressure concentrates), you have both SBTi (internal decarbonization) and CBAM (external trade-carbon) experience, and GRI/SASB credibility on disclosure. That lets you start from a base — not zero — in corporate climate strategy, supply-chain climate-risk assessment, and ESG ratings analysis. Versus jumping straight into climate finance (a gap to close), supply-chain climate risk is the intersection where your stack is most complete and demand is accelerating — and you don’t have to compete with finance backgrounds.',
        evidence_ref: 'listed-manufacturer clients; SBTi and CBAM experience; GRI/SASB credentials',
      },
      mba_readiness: {
        body: 'Your key MBA blocker is not depth of experience — it is that you don’t yet have a clear reason to go. You say you might apply in 6–12 months but haven’t decided. The core of an MBA essay is “where I’m going and why an MBA is a necessary step,” but you are still exploring the target lane. An essay written now would read as directionless.',
        evidence_ref: '“might apply in 6–12 months but haven’t decided”',
      },
      commercial_clarity: {
        body: 'Your impact currently sounds like “compliance completed” rather than commercial value. You describe work through frameworks and deliverables, rarely through effect on a client’s decision or cost — e.g. what the SBTi project changed about a client’s carbon path. That undersells your commercial credibility.',
        evidence_ref: 'how the ESG reporting and framework work is described',
      },
      international_positioning: {
        body: 'Your profile reads locally Taiwanese for now. CBAM and TCFD are international frameworks — among the few signals that travel — but your experience is narrated around Taiwanese clients, so cross-region credibility isn’t lit up yet.',
        evidence_ref: 'CBAM/TCFD international frameworks; mostly Taiwan clients',
      },
      interview_readiness: {
        body: 'The question type you would most struggle with is the “point-of-view” question — e.g. “what do you think is the biggest barrier to Taiwanese manufacturers decarbonizing, and why?” You answer framework questions fluently, but stance questions don’t yet have a prepared answer.',
        evidence_ref: 'tendency to describe yourself via a list of frameworks',
      },
      cv_readiness: {
        body: 'The one structural issue on your CV is that framework names stand in for outcomes: each line is a framework you worked on, with little quantified result or judgment. A reader finishes knowing what you touched, not what you changed.',
        evidence_ref: 'GRI/SASB/SBTi listed side by side as bullets',
      },
      recommended_next_move: {
        body: 'Within two weeks, take the most substantial SBTi or CBAM project you ran and write a 150-word “point-of-view” note: the one real obstacle to Taiwanese manufacturing’s transition that project revealed, and your judgment on it. Build the “point of view” muscle first — it is the core you’ll reuse whether you switch roles or apply to an MBA.',
        evidence_ref: 'SBTi / CBAM project experience',
      },
      suggested_paid_next_step: {
        body: 'Your situation fits “get the climate-career positioning clear first; MBA later.” The Climate Positioning Sprint is built for exactly this: use your real evidence to settle a target lane, name your differentiation, and map the two moves — instead of rushing an application that carries the fog into the essays. It is the natural continuation of this diagnosis, not a sales pivot.',
        evidence_ref: 'considering an MBA but target lane undecided',
      },
    },
  },
};
