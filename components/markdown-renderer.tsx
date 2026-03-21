"use client";

import React from "react";

function parseLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Match in priority order: link > bold > inline code > italic
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find the earliest match
    const candidates = [
      linkMatch && linkMatch.index !== undefined ? { type: "link", match: linkMatch, idx: linkMatch.index } : null,
      boldMatch && boldMatch.index !== undefined ? { type: "bold", match: boldMatch, idx: boldMatch.index } : null,
      codeMatch && codeMatch.index !== undefined ? { type: "code", match: codeMatch, idx: codeMatch.index } : null,
      italicMatch && italicMatch.index !== undefined ? { type: "italic", match: italicMatch, idx: italicMatch.index } : null,
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; idx: number }[];

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    const best = candidates.reduce((a, b) => a.idx <= b.idx ? a : b);

    if (best.idx > 0) {
      parts.push(remaining.slice(0, best.idx));
    }

    if (best.type === "link") {
      const [full, text, href] = best.match;
      parts.push(
        <a key={key++} href={href} className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700">
          {text}
        </a>
      );
      remaining = remaining.slice(best.idx + full.length);
    } else if (best.type === "bold") {
      parts.push(<strong key={key++}>{best.match[1]}</strong>);
      remaining = remaining.slice(best.idx + best.match[0].length);
    } else if (best.type === "code") {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-muted text-xs font-mono text-emerald-700 dark:text-emerald-300">
          {best.match[1]}
        </code>
      );
      remaining = remaining.slice(best.idx + best.match[0].length);
    } else if (best.type === "italic") {
      parts.push(<em key={key++}>{best.match[1]}</em>);
      remaining = remaining.slice(best.idx + best.match[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2);
      elements.push(
        <div key={`tbl-${tableKey++}`} className="my-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-card/80">
                {header.map((cell, i) => (
                  <th key={i} className="px-3 py-1.5 text-left font-semibold">{parseLine(cell.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5">{parseLine(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) inTable = true;
      const cells = trimmed.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (trimmed.match(/^\|[\s-|:]+\|$/)) {
        tableRows.push(cells);
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (trimmed === "" || trimmed === "---" || trimmed === "***") {
      elements.push(<div key={i} className="h-2" />);
    } else if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="text-xs font-bold mt-2 mb-0.5 text-foreground uppercase tracking-wide text-muted-foreground">
          {parseLine(trimmed.slice(5))}
        </h4>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold mt-2 mb-0.5 text-foreground">
          {parseLine(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-bold mt-3 mb-1 text-foreground">
          {parseLine(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-lg font-bold mt-3 mb-1 text-foreground">
          {parseLine(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith("> ")) {
      elements.push(
        <div key={i} className="pl-3 border-l-2 border-emerald-400 text-muted-foreground italic text-sm my-1">
          {parseLine(trimmed.slice(2))}
        </div>
      );
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 pl-2 text-muted-foreground">
          <span className="mt-0.5 text-emerald-500">•</span>
          <span>{parseLine(trimmed.slice(2))}</span>
        </div>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.+)/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-1.5 pl-2 text-muted-foreground">
            <span className="font-semibold text-emerald-600 min-w-[1rem]">{match[1]}.</span>
            <span>{parseLine(match[2])}</span>
          </div>
        );
      }
    } else {
      elements.push(
        <p key={i} className="text-muted-foreground">{parseLine(trimmed)}</p>
      );
    }
  }

  if (inTable) flushTable();

  return <div className="space-y-0.5 leading-relaxed">{elements}</div>;
}
