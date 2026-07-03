import { describe, expect, it } from 'vitest';
import { fillEmailTemplate, maskEmail, stageWindow } from '@/lib/followups';

const NOW = new Date('2026-07-03T02:00:00Z');

describe('stageWindow', () => {
  it('d2 opens at 2 days and closes at 6; d6 opens at 6 and closes at 14', () => {
    const d2 = stageWindow('d2', NOW);
    expect(d2.newestAllowed).toBe('2026-07-01T02:00:00.000Z');
    expect(d2.oldestAllowed).toBe('2026-06-27T02:00:00.000Z');
    const d6 = stageWindow('d6', NOW);
    expect(d6.newestAllowed).toBe('2026-06-27T02:00:00.000Z');
    expect(d6.oldestAllowed).toBe('2026-06-19T02:00:00.000Z');
  });

  it('windows do not overlap — a lead is never eligible for both stages at once', () => {
    // d2 selects created_at in (oldest, newest]; d6's newest equals d2's oldest,
    // so the same timestamp can only fall in one window.
    expect(stageWindow('d2', NOW).oldestAllowed).toBe(stageWindow('d6', NOW).newestAllowed);
  });
});

describe('fillEmailTemplate', () => {
  const base = {
    locale: 'zh-TW' as const,
    reportUrl: 'https://example.com/r/abc',
    personalLine: '你在報告裡提到的儲能專案,是很少人有的實績。',
    categoryNote: '你的類型下一步是找一個能量化的案子。',
  };

  it('fills all placeholders', () => {
    const out = fillEmailTemplate(
      '{{name}} 你好，\n\n{{personal_line}}\n\n{{category_note}}\n\n{{report_url}}',
      { ...base, name: '小明' },
    );
    expect(out).toBe(
      '小明 你好，\n\n你在報告裡提到的儲能專案,是很少人有的實績。\n\n你的類型下一步是找一個能量化的案子。\n\nhttps://example.com/r/abc',
    );
  });

  it('drops the name token gracefully in zh-TW when name is missing', () => {
    const out = fillEmailTemplate('{{name}} 你好，', { ...base, name: null });
    expect(out).toBe('你好，');
  });

  it("falls back to 'there' in en when name is missing", () => {
    const out = fillEmailTemplate('Hi {{name}},', { ...base, locale: 'en', name: '  ' });
    expect(out).toBe('Hi there,');
  });

  it('collapses blank runs left by empty lines', () => {
    const out = fillEmailTemplate('a\n\n\n\nb', { ...base, name: 'x' });
    expect(out).toBe('a\n\nb');
  });
});

describe('maskEmail', () => {
  it('keeps first character and domain only', () => {
    expect(maskEmail('michael@gmail.com')).toBe('m***@gmail.com');
  });
});
