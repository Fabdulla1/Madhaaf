"use client";

import { useEffect, useState } from "react";
import { type ApiResult, type OrthographyVersion, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";
import { MarkdownContent } from "./markdown";

const rules = [
  { symbol: "a", rule: "Short A — provisional" },
  { symbol: "aa", rule: "Long A — provisional" },
  { symbol: "n", rule: "Fully pronounced N" },
  { symbol: "(n)", rule: "Nasalization of the preceding vowel" },
  { symbol: "l", rule: "Ordinary L" },
  { symbol: "'l", rule: "Proposed special L; pronunciation under investigation" },
  { symbol: "gh", rule: "Provisional consonant spelling" },
  { symbol: "ch", rule: "Provisional consonant spelling" },
];

export function OrthographyContent() {
  const [result, setResult] = useState<ApiResult<OrthographyVersion | null> | null>(null);
  const published = result?.status === "success" ? result.data : null;
  const showInitialRules = !published || published.label === "0.3";

  useEffect(() => {
    const controller = new AbortController();
    readPublicApi<OrthographyVersion | null>("/api/orthography", controller.signal)
      .then(setResult).catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <div className="orthography-layout">
      <div>
        <div className="draft-banner">
          <span className="eyebrow">Current working version</span>
          <strong>{published
            ? (/^draft\b/i.test(published.label) ? published.label : `Draft ${published.label}`)
            : "Draft 0.3"}</strong>
          <p>
            These conventions are developing. They are not presented as a
            formally established community or academic standard.
          </p>
        </div>
        {showInitialRules && <section className="orthography-rules">
          <h2>Working conventions</h2>
          <p>
            The following rules were supplied for this project. Spellings
            retain the apostrophe and <code>(n)</code> exactly.
          </p>
          <div className="rules-table" role="table" aria-label="Working spelling conventions">
            <div role="row" className="rules-table__heading"><span role="columnheader">Symbol</span><span role="columnheader">Current use</span></div>
            {rules.map((rule) => (
              <div role="row" key={rule.symbol}>
                <code role="cell">{rule.symbol}</code>
                <span role="cell">{rule.rule}</span>
              </div>
            ))}
          </div>
        </section>}
        <section className="orthography-editorial">
          <h2>{showInitialRules ? "Editorial notes" : "Current guide"}</h2>
          {!result ? <LoadingState label="Loading editorial notes…" /> : result.status === "success" && result.data ? (
            result.data.body_markdown
              ? <MarkdownContent content={result.data.body_markdown} />
              : <ContentState title="Notes are being prepared" description="Further examples and explanations will appear after editorial review." />
          ) : result.status === "success" ? <ContentState
            title="No published editorial notes yet"
            description="The working conventions above were provided for the initial archive."
          /> : <ContentState
            title="Editorial notes unavailable"
            description="The working conventions above remain available. Further notes could not be loaded right now."
          />}
        </section>
      </div>
      {showInitialRules && <aside className="side-note">
        <p className="eyebrow">Open questions</p>
        <h2>Still under study.</h2>
        <p>
          The values of <code>a</code>, <code>aa</code>, <code>gh</code>, and
          <code> ch</code> remain provisional. The exact phonetic realization
          of <code>&apos;l</code> is still being investigated.
        </p>
      </aside>}
    </div>
  );
}
