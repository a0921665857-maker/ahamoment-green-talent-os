'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { phCapture } from '@/components/PostHogProvider';
import {
  CURRENCY_PREFIX,
  MBA_CURRENCIES,
  type MbaCurrency,
  type MbaRoiCopy,
  type ProgrammeYears,
} from '@/content/mbaRoi';

/**
 * MBA ROI 計算器 — pure client-side maths. No API, no LLM, no network call:
 * nothing the reader types leaves the browser (the page copy promises this).
 *
 *   opportunityCost = currentSalary × years        (the salary you don't earn)
 *   totalInvested   = tuition + opportunityCost
 *   netCost         = totalInvested − scholarship
 *   salaryLift      = futureSalary − currentSalary
 *   paybackYears    = netCost ÷ salaryLift         (only when salaryLift > 0)
 *   tenYearNet      = salaryLift × 10 − netCost
 *
 * Division is guarded: when salaryLift ≤ 0 we render 「回不了本」, never Infinity/NaN.
 */

const YEAR_OPTIONS: ProgrammeYears[] = [1, 2];

/** Keeps a runaway paste (or an `e`-notation number) from blowing up the figures. */
const MAX_INPUT = 1e12;

/** Empty / junk / negative all collapse to 0 — the UI must never see NaN. */
function toNum(raw: string): number {
  const n = Number(raw.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, MAX_INPUT);
}

/** Deterministic grouping (no Intl) so SSR and client render byte-identical. */
function group(n: number): string {
  return Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

type Status = 'ok' | 'never' | 'instant';

export function MbaRoiCalculator({
  t,
  salaryReportHref,
}: {
  t: MbaRoiCopy;
  salaryReportHref: string;
}) {
  const d = t.defaults;
  const [currency, setCurrency] = useState<MbaCurrency>(d.currency);
  const [currentSalary, setCurrentSalary] = useState(String(d.currentSalary));
  const [tuition, setTuition] = useState(String(d.tuition));
  const [years, setYears] = useState<ProgrammeYears>(d.years);
  const [scholarship, setScholarship] = useState(String(d.scholarship));
  const [futureSalary, setFutureSalary] = useState(String(d.futureSalary));

  // Count a use only once the visitor actually edits something, so a page view
  // isn't mistaken for a calculation.
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    const touched =
      currency !== d.currency ||
      currentSalary !== String(d.currentSalary) ||
      tuition !== String(d.tuition) ||
      years !== d.years ||
      scholarship !== String(d.scholarship) ||
      futureSalary !== String(d.futureSalary);
    if (!touched) return;
    tracked.current = true;
    phCapture('mba_roi_calculated', { currency });
  }, [currency, currentSalary, tuition, years, scholarship, futureSalary, d]);

  function reset() {
    setCurrency(d.currency);
    setCurrentSalary(String(d.currentSalary));
    setTuition(String(d.tuition));
    setYears(d.years);
    setScholarship(String(d.scholarship));
    setFutureSalary(String(d.futureSalary));
  }

  const r = useMemo(() => {
    const cur = toNum(currentSalary);
    const tui = toNum(tuition);
    const sch = toNum(scholarship);
    const fut = toNum(futureSalary);

    const opportunityCost = cur * years;
    const totalInvested = tui + opportunityCost;
    const netCost = totalInvested - sch;
    const salaryLift = fut - cur;
    const tenYearNet = salaryLift * 10 - netCost;

    let status: Status;
    let paybackYears = 0;
    if (salaryLift <= 0) {
      status = 'never'; // no lift to amortise against — never divide
    } else if (netCost <= 0) {
      status = 'instant'; // scholarship already covers everything
    } else {
      status = 'ok';
      paybackYears = netCost / salaryLift;
    }

    return { tui, opportunityCost, totalInvested, netCost, salaryLift, tenYearNet, paybackYears, status };
  }, [currentSalary, tuition, scholarship, futureSalary, years]);

  const prefix = CURRENCY_PREFIX[currency];
  const money = (n: number) => `${n < 0 ? '-' : ''}${prefix}${group(n)}`;
  const paybackText = r.paybackYears.toFixed(1);

  const verdict =
    r.status === 'never'
      ? t.verdictNever
      : r.status === 'instant'
        ? t.verdictInstant
        : (r.tenYearNet >= 0 ? t.verdictOk : t.verdictOkNegative)
            .replace('{years}', paybackText)
            .replace('{net}', money(Math.abs(r.tenYearNet)));

  const numberField = (
    id: string,
    field: { label: string; help: string },
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {field.label}
      </label>
      <div className="mt-1.5 flex items-center rounded-lg border border-line bg-paper focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/30">
        <span className="pl-4 text-sm text-ink-soft" aria-hidden>
          {prefix}
        </span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_INPUT}
          step={1000}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full flex-1 rounded-r-lg bg-transparent px-2 py-3 text-ink tabular-nums outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{field.help}</p>
    </div>
  );

  const tile = (label: string, help: string, figure: string, positive: boolean) => (
    <div className="rounded-xl border border-line bg-paper p-5">
      <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${positive ? 'text-pine' : 'text-ink'}`}
      >
        {figure}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{help}</p>
    </div>
  );

  return (
    <div className="grid gap-6">
      {/* ---------- inputs ---------- */}
      <section className="rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold">{t.formTitle}</h2>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-ink-soft underline-offset-2 hover:text-pine hover:underline"
          >
            {t.resetLabel}
          </button>
        </div>

        {/* currency — display only, never an FX conversion */}
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">{t.currencyLabel}</legend>
          <div className="mt-1.5 inline-flex rounded-lg border border-line p-1">
            {MBA_CURRENCIES.map((c) => (
              <label
                key={c}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm tabular-nums transition focus-within:ring-2 focus-within:ring-pine/30 ${
                  c === currency ? 'bg-pine font-medium text-paper' : 'text-ink-soft hover:text-pine'
                }`}
              >
                <input
                  type="radio"
                  name="mba-roi-currency"
                  value={c}
                  checked={c === currency}
                  onChange={() => setCurrency(c)}
                  className="sr-only"
                />
                {c}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">{t.formNote}</p>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {numberField('mba-current-salary', t.fields.currentSalary, currentSalary, setCurrentSalary)}
          {numberField('mba-tuition', t.fields.tuition, tuition, setTuition)}

          {/* programme length */}
          <fieldset>
            <legend className="text-sm font-medium">{t.fields.years.label}</legend>
            <div className="mt-1.5 inline-flex rounded-lg border border-line p-1">
              {YEAR_OPTIONS.map((y) => (
                <label
                  key={y}
                  className={`cursor-pointer rounded-md px-5 py-2 text-sm tabular-nums transition focus-within:ring-2 focus-within:ring-pine/30 ${
                    y === years ? 'bg-pine font-medium text-paper' : 'text-ink-soft hover:text-pine'
                  }`}
                >
                  <input
                    type="radio"
                    name="mba-roi-years"
                    value={y}
                    checked={y === years}
                    onChange={() => setYears(y)}
                    className="sr-only"
                  />
                  {y === 1 ? t.fields.years.one : t.fields.years.two}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{t.fields.years.help}</p>
          </fieldset>

          {numberField('mba-scholarship', t.fields.scholarship, scholarship, setScholarship)}

          <div className="sm:col-span-2">
            {numberField('mba-future-salary', t.fields.futureSalary, futureSalary, setFutureSalary)}
            <p className="mt-2 text-xs text-ink-soft">
              {t.salaryReportLinkLead}{' '}
              <a href={salaryReportHref} className="text-pine underline-offset-2 hover:underline">
                {t.salaryReportLinkText}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ---------- results ---------- */}
      <section aria-live="polite">
        <h2 className="sr-only">{t.resultsTitle}</h2>

        {/* the answer */}
        <div className="rounded-2xl bg-pine px-6 py-7 text-paper sm:px-7">
          <p className="text-xs uppercase tracking-eyebrow text-paper/70">{t.results.payback.label}</p>
          <p
            className={`mt-2 font-semibold tabular-nums ${
              r.status === 'never' ? 'text-3xl' : 'text-4xl sm:text-5xl'
            }`}
          >
            {r.status === 'never' ? t.paybackNever : `${paybackText} ${t.paybackUnit}`}
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-paper/90">{verdict}</p>
          <p className="mt-3 text-xs text-paper/60">{t.results.payback.help}</p>
        </div>

        {/* the working */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-eyebrow text-ink-soft">
              {t.results.totalInvested.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {money(r.totalInvested)}
            </p>
            <p className="mt-2 text-xs tabular-nums text-ink-soft">
              {t.breakdownTuition} {money(r.tui)} + {t.opportunityLabel} {money(r.opportunityCost)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {t.results.totalInvested.help}
            </p>
          </div>

          {tile(t.results.netCost.label, t.results.netCost.help, money(r.netCost), false)}
          {tile(
            t.results.salaryLift.label,
            t.results.salaryLift.help,
            money(r.salaryLift),
            r.salaryLift > 0,
          )}
          {tile(
            t.results.tenYear.label,
            t.results.tenYear.help,
            money(r.tenYearNet),
            r.tenYearNet > 0,
          )}
        </div>
      </section>
    </div>
  );
}
