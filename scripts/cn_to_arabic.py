#!/usr/bin/env python3
"""Convert Chinese-numeral quantities to Arabic numerals in judgment content.

    python scripts/cn_to_arabic.py --dry-run    # every proposed change, with context
    python scripts/cn_to_arabic.py              # apply

WHY THIS IS NOT A REGEX SWEEP

In Chinese, 一 is a number in 一千七百五十 and not a number in 一句話, 一律, 一起,
一旦. A blind sweep produces text no native reader accepts. A run is converted
only when the context proves it is a quantity.

Three defects found while building this, each now guarded by a rule:

1. A magnitude character on its own is a unit, not a number. The source already
   contains Arabic amounts with Chinese units — "6,000 萬元" — and an early
   version read that lone 萬 as ten thousand, giving "6,000 10,000元".
   Rule: a run with no digit character is never converted.

2. 百分之十二 became 百分之 12. Taiwanese writing uses 12%.
   Rule: 百分之X is rewritten as X%.

3. 一百萬 became 1,000,000. A Taiwanese CFO reads 100 萬.
   Rule: money and bare amounts keep their 萬/億 word and only the digits
   change. Mass and counts get full digits with separators, because emission
   figures are written 68,000 公噸, not 6.8 萬公噸.

4. Single characters were catastrophic. 零件廠 (a components factory) became
   "0 件廠", 每一兩年 (every year or two) became "12 年", and 公司一年做的事
   became "公司 1 年". A lone 一/二/零 in Chinese prose is usually a word, not a
   figure.
   Rule: only runs of two characters or more convert, plus a handful of named
   patterns where a figure is unambiguous — years, ROC years, 月/日 dates,
   legal article numbers, Scope labels, percentages. Prose ordinals (第二件事)
   and counting words (三件事) stay Chinese on purpose.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

DIGITS = {
    "〇": 0, "零": 0, "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4,
    "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
}
SMALL_UNITS = {"十": 10, "百": 100, "千": 1000}
BIG_UNITS = {"萬": 10**4, "億": 10**8}
NUM_CHARS = set(DIGITS) | set(SMALL_UNITS) | set(BIG_UNITS)
# 點 is deliberately NOT a numeral character. It is a word in 高點, 重點, 觀點 and
# 起點, and including it let "盤中高點八十二" match as one run whose value was the
# decimal ".82". Decimals are handled by DECIMAL_RE, which requires digits on
# both sides.
MAGNITUDES = set(SMALL_UNITS) | set(BIG_UNITS)

MONEY_UNITS = ["億元", "萬元", "元"]
MASS_UNITS = ["公噸", "噸"]

# Units that, following a run, prove it is a quantity.
UNITS = MONEY_UNITS + MASS_UNITS + [
    "％", "%", "個百分點", "百分點",
    "個月", "個工作日", "年度", "年", "月", "日", "天", "週", "小時", "分鐘",
    "頁", "倍", "度", "瓩", "張", "家", "名", "人", "筆", "件", "條", "章", "節", "題", "組", "級",
    "美元", "歐元", "公里", "公尺",
]

# For a SINGLE numeral character, only a MEASURED unit justifies a figure.
#
# The units deliberately absent are the prose counters — 件, 張, 條, 頁, 個,
# 次, 份, 家, 人, 段, 句. A pass that included them turned 這三件事 into 這 3
# 件事, 寫出一頁筆記 into 寫出 1 頁筆記, and 拿一張表 into 拿 1 張表. In every
# one of those the numeral is the article "a", not the figure, and a Taiwanese
# reader hears the difference immediately.
SINGLE_OK = MONEY_UNITS + MASS_UNITS + [
    "％", "%", "年", "月", "日", "天", "週", "小時", "分鐘", "個月", "個工作日",
    "倍", "度", "瓩", "美元", "歐元",
]

# Words that merely BEGIN with a numeral character. Reading the numeral as a
# figure here produces text no native reader accepts: 一律, 一旦, 一句話,
# 零件廠, 一部分. Checked against the whole word, not the unit.
WORD_PREFIXES = (
    "一律", "一旦", "一起", "一樣", "一致", "一句", "一部", "一般", "一連",
    "一手", "一口", "一邊", "一直", "一定", "一時", "一點", "一方", "一環",
    "一半", "一輪", "一批", "一堆", "一種", "一個人", "一回事", "一下",
    "零件", "零和", "零碎", "零售", "零星",
    "二手", "三方", "三角",
)

# Places where a lone numeral is unambiguously a figure even without a unit,
# because the preceding words name a quantity. 排放量調整係數為一 is the case
# this exists for: a coefficient of 1 read as the word 一 looks like a typo
# beside every other figure in the same sentence.
BARE_FIGURE_PREFIXES = ("係數為", "係數是", "倍數為", "權重為", "比例為")

UNIT_RE = "|".join(re.escape(u) for u in sorted(UNITS, key=len, reverse=True))
SINGLE_OK_RE = "|".join(re.escape(u) for u in sorted(SINGLE_OK, key=len, reverse=True))

# A four-character year, before 年 or before punctuation that ends the mention
# ("等二〇二八、2029 年" left the first year unconverted while its neighbour was
# already a figure).
YEAR_RE = re.compile(r"[一二][〇零一二三四五六七八九]{3}(?=年|[、，。）」～–至到])")
ROC_YEAR_RE = re.compile(r"(民國)([〇零一二三四五六七八九]{2,3})(?=年)")
# 八月三十一日 → 8 月 31 日. Both halves in one rule so a date never ends up half
# converted, which is what happened when only the day cleared the length rule.
DATE_RE = re.compile(
    rf"([{''.join(NUM_CHARS)}]+)月([{''.join(NUM_CHARS)}]+)日"
)
# A month named right after a year is part of a date, so it takes a figure even
# when it is the lone 一 that is otherwise left alone: 2018 年一月至 2025 年十月
# must not come out half converted.
MONTH_IN_DATE_RE = re.compile(rf"([0-9]\s*年\s*)([{''.join(NUM_CHARS)}]{{1,3}})月")
# Legal citations are references, so a figure is right: 氣候變遷因應法第三十三條.
ARTICLE_RE = re.compile(rf"第([{''.join(NUM_CHARS)}]+)條")
# Units where Taiwanese practice is full digits rather than a 萬/億 word.
COUNT_UNITS = MASS_UNITS + ["張", "件", "家", "人", "筆", "份", "個月", "頁", "條", "級", "組"]
# A run made only of magnitude characters (十萬, 千萬) is a number, but 百萬瓦 is
# a megawatt and 十分 means "very". Only these units make it unambiguous.
MAGNITUDE_ONLY_UNITS = MASS_UNITS + ["萬元", "億元", "元", "度", "美元", "歐元"]
SCOPE_RE = re.compile(r"(範疇)([一二三])(?![一二三十百千萬億])")
# 範疇一二三 / 範疇 1 二三 — two or three scopes listed together. Must run AFTER
# the single-scope rule, which otherwise leaves "範疇 1 二三".
MULTI_SCOPE_RE = re.compile(r"(範疇\s*1?)\s*([一二三]{2,3})(?![十百千萬億])")
PERCENT_RE = re.compile(rf"百分之([{''.join(NUM_CHARS)}]+點?[{''.join(DIGITS)}]*)")
# 一百三十四點四萬元 → 134.4 萬元. The trailing magnitude multiplies the decimal,
# which the earlier version could not express and therefore skipped entirely.
DECIMAL_RE = re.compile(
    rf"([{''.join(NUM_CHARS)}]+)點([{''.join(DIGITS)}]+)([{''.join(MAGNITUDES)}]*)"
)
NUM_RUN = re.compile(rf"[{''.join(NUM_CHARS)}]+")

CONTEXT: list[tuple[str, str, str]] = []


def parse_int(s: str) -> int | None:
    if not s:
        return None
    if all(c in DIGITS for c in s):
        return int("".join(str(DIGITS[c]) for c in s))
    total = section = current = 0
    for ch in s:
        if ch in DIGITS:
            current = DIGITS[ch]
        elif ch in SMALL_UNITS:
            section += (current or 1) * SMALL_UNITS[ch]
            current = 0
        elif ch in BIG_UNITS:
            section = (section + current) or 1
            total += section * BIG_UNITS[ch]
            section = current = 0
        else:
            return None
    return total + section + current


def parse_value(s: str) -> float | None:
    """Chinese numeral run → numeric value, or None if it is not a number."""
    if "點" in s:
        head, _, tail = s.partition("點")
        whole = parse_int(head) if head else 0
        if whole is None or not tail or not all(c in DIGITS for c in tail):
            return None
        return float(f"{whole}.{''.join(str(DIGITS[c]) for c in tail)}")
    return parse_int(s)


def trim(x: float) -> str:
    """Format a number with thousands separators and no trailing zeros."""
    if x == int(x):
        return f"{int(x):,}"
    return f"{x:,.3f}".rstrip("0").rstrip(".")


def format_money(value: float) -> tuple[str, str]:
    """Money keeps its magnitude word: 7,600 萬 / 1.161 億 / 300 (bare).

    Returns (figure, magnitude_word_to_insert_before_the_unit).
    """
    if value >= 10**8:
        return trim(value / 10**8), "億"
    if value >= 10**4:
        return trim(value / 10**4), "萬"
    return trim(value), ""


def is_quantity(run: str, following: str, preceding: str = "") -> bool:
    if not any(c in DIGITS for c in run):
        # Rule 1 of this script: a run with no digit character is a unit, not a
        # number, so 6,000 萬元 never becomes 6,000 10,000元. The one exception
        # is a small-magnitude character standing alone — 十年, 百噸 — where the
        # character IS the figure. 數十萬 and 幾十年 are approximations, not
        # figures, so their prefixes are excluded.
        if run in SMALL_UNITS and not (preceding and preceding[-1] in "數幾好上將近約"):
            return re.match(rf"^({SINGLE_OK_RE})", following) is not None
        # Several magnitude characters together are a figure — 十萬噸 is 100,000
        # tonnes. But 百萬瓦 is a megawatt and 十分 means "very", so this needs a
        # measured unit, and an approximation prefix still disqualifies it
        # (幾十萬 stays "a few hundred thousand").
        if len(run) >= 2 and not (preceding and preceding[-1] in "數幾好上將近約"):
            return (
                re.match(rf"^({'|'.join(re.escape(u) for u in MAGNITUDE_ONLY_UNITS)})", following)
                is not None
            )
        return False
    # 兩 is a number at the start of a run, or straight after a magnitude
    # (一萬兩千 = 12,000). 一兩年 means "a year or two", and reading that as 12
    # was one of the defects this guard exists for.
    for i, ch in enumerate(run):
        if ch == "兩" and i > 0 and run[i - 1] not in MAGNITUDES:
            return False
    if (run + following).startswith(WORD_PREFIXES):
        return False
    if len(run) == 1:
        # 同一噸碳 is "the same tonne", not "the 1 tonne". These prefixes turn a
        # lone numeral into part of a word. Only single characters are at risk:
        # 每噸三百元 is a price and must convert.
        if preceding and preceding[-1] in "同任每其之唯統第另":
            return False
        # A magnitude character standing alone (十, 百, 千) is always a figure:
        # unlike 一 or 二 it has no word-forming reading.
        if run in SMALL_UNITS and following:
            return re.match(rf"^({SINGLE_OK_RE})", following) is not None
        if preceding.endswith(BARE_FIGURE_PREFIXES):
            return True
        # A lone 一 is the article "a" far more often than the figure 1, and
        # 一年 / 一週 / 一噸 read perfectly well in Chinese beside an Arabic
        # amount ("一年碳費 430 萬元"). Only a named bare-figure context above
        # promotes it. Everything else keeps its 一.
        if run == "一":
            return False
        # Otherwise a lone digit needs a measured unit. 三件事, 兩條路 and
        # 一張表 all stay Chinese because their units are not on the list.
        return re.match(rf"^({SINGLE_OK_RE})", following) is not None
    if "點" in run:
        return True
    if any(c in run for c in BIG_UNITS) or any(c in run for c in SMALL_UNITS):
        return True
    # Positional run with no magnitude: only the year reading is safe.
    return following.startswith("年")


def convert_text(text: str) -> tuple[str, list[tuple[str, str]]]:
    log: list[tuple[str, str]] = []

    def year_sub(m: re.Match[str]) -> str:
        raw = m.group(0)
        out = "".join(str(DIGITS[c]) for c in raw)
        log.append((raw + "年", out + " 年"))
        return out + " "

    out = YEAR_RE.sub(year_sub, text)

    def scope_sub(m: re.Match[str]) -> str:
        after = f"{m.group(1)} {DIGITS[m.group(2)]}"
        log.append((m.group(0), after))
        return after

    out = SCOPE_RE.sub(scope_sub, out)

    def pct_sub(m: re.Match[str]) -> str:
        value = parse_value(m.group(1))
        if value is None:
            return m.group(0)
        after = f"{trim(value)}%"
        log.append((m.group(0), after))
        return after

    out = PERCENT_RE.sub(pct_sub, out)

    def roc_sub(m: re.Match[str]) -> str:
        value = parse_int(m.group(2))
        after = f"{m.group(1)} {value}" if value is not None else m.group(0)
        if value is not None:
            log.append((m.group(0), after))
        return after

    out = ROC_YEAR_RE.sub(roc_sub, out)

    def date_sub(m: re.Match[str]) -> str:
        mo, day = parse_value(m.group(1)), parse_value(m.group(2))
        if mo is None or day is None:
            return m.group(0)
        after = f"{trim(mo)} 月 {trim(day)} 日"
        log.append((m.group(0), after))
        return after

    out = DATE_RE.sub(date_sub, out)

    def month_in_date_sub(m: re.Match[str]) -> str:
        mo = parse_value(m.group(2))
        if mo is None:
            return m.group(0)
        after = f"{m.group(1)}{trim(mo)} 月"
        log.append((m.group(0), after))
        return after

    out = MONTH_IN_DATE_RE.sub(month_in_date_sub, out)

    def article_sub(m: re.Match[str]) -> str:
        value = parse_value(m.group(1))
        if value is None:
            return m.group(0)
        after = f"第 {trim(value)} 條"
        log.append((m.group(0), after))
        return after

    out = ARTICLE_RE.sub(article_sub, out)

    def decimal_sub(m: re.Match[str]) -> str:
        """一百三十四點四萬元 → 134.4 萬元.

        Handled before the general pass because 點 is not a numeral character:
        including it let 盤中高點八十二 match as one run whose value read as the
        decimal .82. Requiring digits on both sides makes 高點 safe.
        """
        whole, frac, magnitude = m.group(1), m.group(2), m.group(3)
        base = parse_int(whole)
        if base is None:
            return m.group(0)
        value = float(f"{base}.{''.join(str(DIGITS[c]) for c in frac)}")
        if magnitude:
            factor = parse_int(magnitude)
            if factor is None:
                return m.group(0)
            tail = m.string[m.end() : m.end() + 4]
            if re.match(rf"^({'|'.join(re.escape(u) for u in COUNT_UNITS)})", tail):
                # Mass and counts get full digits: emissions are written
                # 25,000 公噸, never 2.5 萬公噸.
                after = f"{trim(value * factor)} "
            else:
                # Money keeps the word: 134.4 萬元, because 1,344,000 元 is not
                # how a Taiwanese reader takes it in.
                after = f"{trim(value)} {magnitude}"
        else:
            after = f"{trim(value)} "
        log.append((m.group(0), after.strip()))
        return after

    out = DECIMAL_RE.sub(decimal_sub, out)

    def multi_scope_sub(m: re.Match[str]) -> str:
        """範疇一二三 → 範疇 1、2、3.

        The single-scope rule left this as "範疇 1 二三", which is worse than
        either form on its own.
        """
        head = m.group(1).rstrip()
        digits = "、".join(str(DIGITS[c]) for c in m.group(2))
        # "範疇 1" already carries the first scope, so the rest joins the same
        # list rather than sitting beside it as "範疇 1 2、3".
        after = f"{head}、{digits}" if head.endswith("1") else f"{head} {digits}"
        log.append((m.group(0), after))
        return after

    out = MULTI_SCOPE_RE.sub(multi_scope_sub, out)

    pieces: list[str] = []
    pos = 0
    for m in NUM_RUN.finditer(out):
        run = m.group(0)
        following = out[m.end() : m.end() + 6]
        if not is_quantity(run, following, out[max(0, m.start() - 6) : m.start()]):
            continue
        value = parse_value(run)
        if value is None:
            continue

        counted = re.match(rf"^({'|'.join(re.escape(u) for u in COUNT_UNITS)})", following)
        if counted:
            # 25,000 公噸, 10,000 張 — full digits, which is how the field writes
            # emissions and credit volumes.
            replacement = trim(value) + " "
        else:
            # Money, and bare amounts that mean money, keep the magnitude word.
            figure, magnitude = format_money(value)
            replacement = f"{figure} {magnitude}" if magnitude else f"{figure} "

        pieces.append(out[pos : m.start()])
        pieces.append(replacement)
        log.append((run, replacement.strip()))
        snippet = out[max(0, m.start() - 14) : m.end() + 14].replace(chr(10), " ")
        CONTEXT.append((run, replacement.strip(), snippet))
        pos = m.end()
    pieces.append(out[pos:])
    joined = "".join(pieces)
    return space_cjk_latin(joined), log


# Han characters plus the CJK punctuation that behaves like one for spacing.
HAN = r"一-鿿㐀-䶿"
# Inserting a space on BOTH sides of a Latin/digit run inside Chinese text is
# the house style of every Chinese publication that sets type carefully. The
# first pass only spaced the right-hand side, which is why the source read
# 「年排放68,000 噸」— spaced after the figure and clamped before it.
_PAD_LEFT = re.compile(rf"([{HAN}])(?=[0-9A-Za-z])")
_PAD_RIGHT = re.compile(rf"([0-9A-Za-z%％])(?=[{HAN}])")


def space_cjk_latin(s: str) -> str:
    s = _PAD_LEFT.sub(r"\1 ", s)
    s = _PAD_RIGHT.sub(r"\1 ", s)
    # A figure and its unit are separated by one space, never two, and never a
    # space before a comma or a full stop.
    s = re.sub(r"[ \t]{2,}", " ", s)
    s = re.sub(r"[ \t]+([，。、；：）」』？！％%])", r"\1", s)
    s = re.sub(r"([（「『])[ \t]+", r"\1", s)
    return s


def walk(node, log: list[tuple[str, str]]):
    if isinstance(node, str):
        out, sub = convert_text(node)
        log.extend(sub)
        return out
    if isinstance(node, list):
        return [walk(v, log) for v in node]
    if isinstance(node, dict):
        return {k: walk(v, log) for k, v in node.items()}
    return node


# Words that take an ordinal, where the source often writes the ordinal and the
# quantity with nothing between them: 「範疇二兩萬六千八百五十噸」. That reads fine in
# Chinese because 範疇二 is a known label, but once both halves are digits the two
# numbers fuse into one wrong number ("範疇 226,850"). The conversion cannot tell
# them apart, so it reports them instead of guessing. 2026-07-30: four of these
# shipped undetected into carbon-accounting worked examples, where a reader who
# adds up the numbers finds them wrong.
ORDINAL_LABELS = "範疇|第|層|類|期|級|章|條|項|款|步|型|版|區|線|階"
FUSION_RE = re.compile(rf"(?:{ORDINAL_LABELS})\s?(?:[0-9]{{3,}}|[0-9]{{1,3}},[0-9]{{3}})")


def fusion_suspects(node: object, path: str = "") -> list[tuple[str, str]]:
    """Label-then-long-number hits worth a human look after conversion."""
    if isinstance(node, str):
        return [(m.group(0), node[max(0, m.start() - 60) : m.end() + 60]) for m in FUSION_RE.finditer(node)]
    if isinstance(node, list):
        return [h for v in node for h in fusion_suspects(v, path)]
    if isinstance(node, dict):
        return [h for v in node.values() for h in fusion_suspects(v, path)]
    return []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--show", type=int, default=0, help="show N contexts per pattern")
    ap.add_argument(
        "--file",
        default=str(Path(__file__).resolve().parent.parent / "content" / "judgment" / "data.json"),
    )
    args = ap.parse_args()

    path = Path(args.file)
    data = json.loads(path.read_text(encoding="utf-8"))
    log: list[tuple[str, str]] = []
    converted = walk(data, log)

    counts = Counter(log)
    print(f"{len(log)} conversions, {len(counts)} distinct patterns")
    for (before, after), n in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {before}  →  {after}   ×{n}")

    if args.show:
        print("\n--- contexts ---")
        shown: Counter = Counter()
        for run, parsed, ctx in CONTEXT:
            if shown[run] >= args.show:
                continue
            shown[run] += 1
            print(f"  {run} → {parsed}")
            print(f"      …{ctx}…")

    suspects = fusion_suspects(converted)
    if suspects:
        print(f"\n!! {len(suspects)} possible ordinal/quantity fusions — check each by hand:")
        for hit, ctx in suspects:
            print(f"  {hit}")
            print(f"      …{ctx}…")
        print("  (a legitimate 「公報第 023 卷」 looks the same as a broken 「範疇 226,850」;")
        print("   only the arithmetic in the surrounding sentence tells them apart)")

    if args.dry_run:
        return 0

    path.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="")
    print(f"\nwrote {path}")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
