import type { ReactNode } from 'react';

/**
 * The explainer bodies are prose plus the occasional list, table, heading or
 * link. Anything fancier is a sign the explainer is too long, so this renderer
 * stays deliberately small: paragraphs, `###` headings, `-` lists, pipe tables,
 * links, inline code, bold.
 *
 * It builds React nodes rather than an HTML string — no dangerouslySetInnerHTML,
 * so authored content can never inject markup. Tables scroll inside their own
 * container so a wide table cannot push the 375px layout sideways.
 */

const INLINE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;

function inline(text: string, k: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(INLINE.source, 'g');
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${k}-i${n++}`;
    if (m[1] !== undefined && m[2] !== undefined) {
      out.push(
        <a
          key={key}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pine underline decoration-line underline-offset-2 hover:decoration-pine"
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <code key={key} className="rounded bg-mist px-1.5 py-0.5 text-[0.9em] text-pine-deep">
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <strong key={key} className="font-semibold text-ink">
          {m[4]}
        </strong>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; rows: string[][] };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] | null = null;
  let table: string[][] | null = null;

  const flush = () => {
    if (list) {
      blocks.push({ kind: 'ul', items: list });
      list = null;
    }
    if (table) {
      blocks.push({ kind: 'table', rows: table });
      table = null;
    }
  };

  for (const line of src.split('\n')) {
    if (/^\s*\|.*\|\s*$/.test(line)) {
      if (list) flush();
      (table ??= []).push(
        line
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim()),
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (table) flush();
      (list ??= []).push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }
    flush();
    if (!line.trim()) continue;
    if (/^#{2,4}\s/.test(line)) blocks.push({ kind: 'h', text: line.replace(/^#{2,4}\s/, '') });
    else blocks.push({ kind: 'p', text: line });
  }
  flush();
  return blocks;
}

/** A separator row (`|---|---|`) is layout, never content. */
function isSeparator(row: string[]): boolean {
  return row.length > 0 && row.every((c) => /^:?-{2,}:?$/.test(c));
}

export function JudgmentMarkdown({ text, className }: { text: string; className?: string }) {
  const blocks = parse(text ?? '');
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        if (b.kind === 'h') {
          return (
            <h4 key={k} className="mt-5 font-semibold first:mt-0">
              {inline(b.text, k)}
            </h4>
          );
        }
        if (b.kind === 'ul') {
          return (
            <ul key={k} className="mt-3 list-disc space-y-1.5 pl-5 first:mt-0">
              {b.items.map((it, j) => (
                <li key={`${k}-${j}`} className="break-words">
                  {inline(it, `${k}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'table') {
          const head = isSeparator(b.rows[1] ?? []) ? b.rows[0] : null;
          const body = head ? b.rows.slice(2) : b.rows;
          return (
            <div key={k} className="mt-4 overflow-x-auto rounded-lg border border-line first:mt-0">
              {/* 18rem keeps columns legible while still fitting inside a card
                  on a 375px screen; anything wider scrolls in this container. */}
              <table className="w-full min-w-[18rem] border-collapse text-sm tabular-nums">
                {head && (
                  <thead>
                    <tr className="bg-mist text-left">
                      {head.map((c, j) => (
                        <th key={`${k}-h${j}`} className="px-3 py-2 font-semibold">
                          {inline(c, `${k}-h${j}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {body.map((row, j) => (
                    <tr key={`${k}-r${j}`} className="border-t border-line align-top">
                      {row.map((c, l) => (
                        <td key={`${k}-r${j}c${l}`} className="px-3 py-2">
                          {inline(c, `${k}-r${j}c${l}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={k} className="mt-4 break-words first:mt-0">
            {inline(b.text, k)}
          </p>
        );
      })}
    </div>
  );
}
