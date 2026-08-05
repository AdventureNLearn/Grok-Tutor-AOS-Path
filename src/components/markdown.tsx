import { cn } from "@/lib/utils";

/** Minimal markdown-ish renderer for tutor replies (no external dep). */
export function SimpleMarkdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n\n+/);

  return (
    <div className={cn("prose-tutor", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const nonEmpty = lines.filter((l) => l.trim());

        // GFM table
        if (
          nonEmpty.length >= 2 &&
          nonEmpty[0].includes("|") &&
          /^\s*\|?[\s:-]+\|/.test(nonEmpty[1])
        ) {
          const rows = nonEmpty
            .filter((_l, idx) => idx !== 1)
            .map((l) =>
              l
                .trim()
                .replace(/^\|/, "")
                .replace(/\|$/, "")
                .split("|")
                .map((c) => c.trim()),
            );
          const header = rows[0] ?? [];
          const body = rows.slice(1);
          return (
            <div key={i} className="overflow-x-auto my-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr>
                    {header.map((h, j) => (
                      <th
                        key={j}
                        className="border border-border bg-elevated/60 px-2 py-1.5 font-medium"
                      >
                        {inline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((c, ci) => (
                        <td key={ci} className="border border-border px-2 py-1.5 align-top">
                          {inline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (lines.every((l) => /^\s*[-*]\s+/.test(l) || l.trim() === "")) {
          return (
            <ul key={i}>
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
                ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l) || l.trim() === "")) {
          return (
            <ol key={i}>
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j}>{inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>
                ))}
            </ol>
          );
        }
        if (block.startsWith("```")) {
          const body = block.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre key={i}>
              <code>{body}</code>
            </pre>
          );
        }
        if (lines.every((l) => /^\s*>/.test(l) || l.trim() === "")) {
          return (
            <blockquote key={i} className="border-l-2 border-teal/50 pl-3 my-2 text-muted">
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <p key={j} className="my-1">
                    {inline(l.replace(/^\s*>\s?/, ""))}
                  </p>
                ))}
            </blockquote>
          );
        }

        // Headings: render heading + any following lines in the same block
        const headingMatch = lines[0]?.match(/^(#{1,3})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const title = headingMatch[2];
          const rest = lines.slice(1).filter((l) => l.trim());
          const HeadingTag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
          return (
            <div key={i} className="space-y-2">
              <HeadingTag>{inline(title)}</HeadingTag>
              {rest.length > 0 ? (
                <div>
                  {rest.map((line, j) => (
                    <p key={j} className="my-1 leading-relaxed">
                      {inline(line)}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }

        if (nonEmpty.length === 1 && /^---+$/.test(nonEmpty[0].trim())) {
          return <hr key={i} className="border-border my-3" />;
        }

        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {inline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function inline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={k++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      parts.push(<em key={k++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={k++}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const mm = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (mm) {
        parts.push(
          <a key={k++} href={mm[2]} target="_blank" rel="noreferrer">
            {mm[1]}
          </a>,
        );
      } else parts.push(token);
    }
    last = m.index + token.length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}
