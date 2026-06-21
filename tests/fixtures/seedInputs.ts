/**
 * Eight seed INPUT texts matching the ROADMAP Phase 4 matrix. These feed
 * scripts/run-seeds.ts, which runs the real extraction → scoring → report
 * pipeline against a live Anthropic key (not available in CI/sandbox).
 * Texts are deliberately realistic but fictional; no real person's data.
 */
import type { InputType, Locale } from '@/lib/constants';
import type { ResultCategory } from '@/lib/constants';

export interface SeedInput {
  id: number;
  name: string;
  locale: Locale;
  inputType: InputType;
  text: string;
  expectCategory: ResultCategory | ResultCategory[];
}

export const seedInputs: SeedInput[] = [
  {
    id: 1,
    name: 'EN CV — strong carbon-markets, MBA-ready',
    locale: 'en',
    inputType: 'cv_pdf',
    expectCategory: 'ready_for_mba_story_sprint',
    text: `JORDAN TAN — Carbon Markets Lead
Singapore | 7 years experience

EXPERIENCE
Carbon Markets Lead, GreenRidge Capital (2022–present)
- Led origination and due diligence on a US$40m voluntary carbon credit portfolio across SE Asia (REDD+, cookstoves, blue carbon).
- Built the team's Article 6 readiness framework; closed 6 offtake agreements totalling 1.2M tCO2e.
- Managed a team of 4 analysts; owned the commercial pipeline and a US$3m revenue target (achieved 118%).
Senior Consultant, Deloitte SEA — Sustainability (2018–2022)
- Delivered SBTi target-setting and Scope 1–3 carbon accounting for 12 listed clients.
- Led CBAM readiness diagnostics for two steel manufacturers.

EDUCATION
BBA (Hons), National University of Singapore, 2017

GOAL
Targeting a top European MBA (INSEAD) to move from carbon markets execution into climate-fund investment leadership. Applying this cycle, R1. Want to relocate to a global investment platform within 18 months.`,
  },
  {
    id: 2,
    name: 'zh-TW CV — Big-4 ESG consultant, vague goals',
    locale: 'zh-TW',
    inputType: 'notes_paste',
    expectCategory: 'career_positioning_before_mba',
    text: `我目前在 KPMG 台灣的永續發展服務組擔任資深顧問，做了大概 6 年。主要負責企業 ESG 報告書、SASB 與 GRI 準則導入，也帶過 SBTi 目標設定的專案，客戶以上市櫃製造業為主。最近開始接觸 TCFD 與 CBAM 的因應評估。

我大概帶 3 到 4 個比較資淺的同事，但比較像專案層級的帶人，不是正式的主管職。

老實說我有點卡住。我知道自己在永續領域累積了不少東西，但說不太清楚下一步要往哪裡走。有想過念 MBA，可能 6 到 12 個月內申請，但還沒決定要不要、也不確定念完要做什麼。有人說我可以往氣候金融或影響力投資走，可是我沒有投資相關的實際經驗，不知道這條路實不實際。`,
  },
  {
    id: 3,
    name: 'EN LinkedIn — climate-tech CS, no MBA intent',
    locale: 'en',
    inputType: 'linkedin_paste',
    expectCategory: 'climate_career_builder',
    text: `About
Customer Success Manager at a climate-tech SaaS company (carbon accounting platform). I help mid-market enterprises onboard, measure their Scope 1–3 footprint, and actually act on the data. 5 years in customer-facing roles, the last 2 in climate tech.

Experience
Customer Success Manager — CarbonLayer (2023–present)
Own a book of 30 enterprise accounts; 94% gross retention. Run quarterly footprint reviews and decarbonization roadmap sessions with sustainability leads.
Customer Success Associate — SaaSWorks (2020–2023)
General B2B SaaS onboarding and support.

Education
BA Communications, 2019

Not looking at an MBA — more interested in going deeper on the climate side and growing into a senior CS or sustainability-strategy role over the next couple of years. Based in Singapore, open to staying regional.`,
  },
  {
    id: 4,
    name: 'EN AI-chat paste — direction-confused analyst',
    locale: 'en',
    inputType: 'notes_paste',
    expectCategory: ['climate_career_builder', 'high_potential_low_commercial_clarity'],
    text: `Me: I'm a sustainability analyst, 5 years in, and I feel stuck. I do a lot of ESG data work — GRI reporting, some TCFD, carbon footprinting for a manufacturing group. Technically I'm solid. I led the data workstream for our group's first integrated report and cut the data collection time by about 40%.

Assistant: That's strong. What's the actual problem?

Me: I don't know what I'm aiming for. People keep telling me I should "move into strategy" or "do climate finance" but I have zero commercial or investment background. I've never owned a budget or a revenue number. I'm thinking about an MBA but honestly I'm not sure if that's the answer or just an expensive way to avoid deciding. Timeline-wise I have no idea — maybe in a year or two?

Assistant: What do you actually enjoy?

Me: The technical depth, the climate impact. I just can't translate it into something a hiring manager for a "better" role would value.`,
  },
  {
    id: 5,
    name: 'EN thin note — profile-building',
    locale: 'en',
    inputType: 'notes_paste',
    expectCategory: 'profile_building_needed',
    text: `Hi — I'm interested in working in climate / sustainability. I studied environmental science and graduated about a year ago. I've done one internship at an NGO doing some research and admin. I really care about climate change and want a meaningful career in it, maybe consulting or something with carbon. Not sure where to start or whether I should do a masters. Any direction would help.`,
  },
  {
    id: 6,
    name: 'EN — strong profile, rambling narrative',
    locale: 'en',
    inputType: 'notes_paste',
    expectCategory: 'strong_profile_weak_story',
    text: `So my background is kind of all over the place but it all connects I promise. I started in management consulting at a boutique firm doing ops work, then I moved into a corporate strategy role at a large energy company, and while I was there I sort of fell into the sustainability team because they needed someone who could model things. I ended up leading our renewable PPA evaluation work and built the financial model that supported a 200MW solar procurement decision — that saved roughly 12% on projected energy costs. Then I did a stint at a green-bond advisory shop. I've managed teams, I've owned numbers, I've presented to the board. I have maybe 8 years total. The thing is when people ask me "what do you do" or "what's your story" I never have a clean answer, I just list everything and watch their eyes glaze over. Not doing an MBA. I want to land a senior climate-finance role in the next 6–12 months but I think my messaging is the problem, not my experience.`,
  },
  {
    id: 7,
    name: 'EN CV — polished, no through-line',
    locale: 'en',
    inputType: 'cv_pdf',
    expectCategory: 'cv_strong_narrative_weak',
    text: `ALEX RIVERA
Sustainability & Operations Professional | Singapore

PROFESSIONAL EXPERIENCE
Operations Manager, LogiCorp (2021–present)
- Managed regional logistics operations across 4 markets; reduced fulfilment costs 9% YoY.
- Implemented an emissions-tracking dashboard for the freight network.
Sustainability Program Manager, RetailGroup (2019–2021)
- Ran the packaging circularity program; diverted 1,400 tonnes of waste annually.
- Coordinated GRI-aligned reporting across 6 business units.
Analyst, ConsultCo (2017–2019)
- Supported ESG diligence and operational improvement engagements.

EDUCATION
BSc Industrial Engineering, 2016

SKILLS
GRI reporting, LCA, operations optimization, stakeholder management, data visualization.`,
  },
  {
    id: 8,
    name: 'zh-TW voice transcript — senior, commercial blind spot',
    locale: 'zh-TW',
    inputType: 'voice_transcript',
    expectCategory: 'high_potential_low_commercial_clarity',
    text: `嗯…我講一下我的背景好了。我在永續這個領域大概做了快十年，現在是一家蠻大的集團裡面的永續部門主管，帶大概十個人的團隊。我們做的事情很廣，從集團的減碳路徑、SBTi 目標設定，到供應鏈的碳盤查，還有 TNFD 自然相關的揭露，這兩年也開始做。

我自己覺得比較強的是…就是我真的懂技術，也帶得動團隊，跨部門溝通也沒問題。我帶過集團第一份 TCFD 報告，也主導了範疇三的盤查方法，那個影響蠻大的。

可是有一件事我一直覺得卡卡的，就是…我好像很難把我做的事情講成「商業價值」。我從來沒有真正背過一個營收數字，或是管過一個損益。每次跟比較商業導向的高層報告，我都覺得我講的東西他們聽得懂、但好像感受不到那個份量。我不打算念 MBA，我比較想知道怎麼讓我的專業被看見成「值多少」，而不是只是「做得很好」。大概未來六到十二個月想動一動。`,
  },
];
