import Link from "next/link";
import type { ReactNode } from "react";

// A deliberately small, safe renderer for the supported editorial Markdown.
// Text and unrecognised HTML are escaped by React; no raw HTML is injected.
function renderInline(value: string): ReactNode[] {
  const tokens = value.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].trim();
      // Editorial links only point to public sections. Backslashes and
      // protocol-relative paths are rejected before Next resolves the URL.
      if (/^\/(?:dictionary(?:\/[a-f0-9-]+)?|history(?:\/[a-z0-9-]+)?|orthography)\/?$/i.test(href)) {
        return <Link key={index} href={href}>{link[1]}</Link>;
      }
      if (/^https?:\/\//i.test(href)) {
        return <a key={index} href={href} rel="noopener noreferrer">{link[1]}</a>;
      }
      return link[1];
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    return token;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const children = renderInline(heading[2]);
      if (heading[1].length === 1) blocks.push(<h2 key={index}>{children}</h2>);
      else if (heading[1].length === 2) blocks.push(<h3 key={index}>{children}</h3>);
      else blocks.push(<h4 key={index}>{children}</h4>);
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      const key = index;
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quote.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(<blockquote key={key}>{renderInline(quote.join(" "))}</blockquote>);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      const key = index;
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={key}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      const key = index;
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={key}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ol>);
      continue;
    }
    const paragraph: string[] = [line];
    const key = index;
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s|>\s|[-*]\s|\d+\.\s)/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={key}>{renderInline(paragraph.join(" "))}</p>);
  }

  return <div className="prose-content">{blocks}</div>;
}
