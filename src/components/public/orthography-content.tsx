"use client";

import { useEffect, useState } from "react";
import { type ApiResult, type OrthographyVersion, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";
import { MarkdownContent } from "./markdown";
import { LetterReferenceTable } from "@/components/letter-reference";

export function OrthographyContent() {
  const [result, setResult] = useState<ApiResult<OrthographyVersion | null> | null>(null);
  const published = result?.status === "success" ? result.data : null;

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
        <section className="orthography-rules">
          <h2>Letters and intended use</h2>
          <p>
            This working letter list was supplied for the project. Use it as a
            reference when writing Kutchi words and examples. Preserve apostrophes,
            vowel marks, and <code>(n)</code> exactly as written.
          </p>
          <LetterReferenceTable />
        </section>
        <section className="orthography-editorial">
          <h2>Published editorial notes</h2>
          <p>These versioned notes document the development of the writing system and may describe earlier draft choices.</p>
          {!result ? <LoadingState label="Loading editorial notes…" /> : result.status === "success" && result.data ? (
            result.data.body_markdown
              ? <MarkdownContent content={result.data.body_markdown} />
              : <ContentState title="Notes are being prepared" description="Further examples and explanations will appear after editorial review." />
          ) : result.status === "success" ? <ContentState
            title="No published editorial notes yet"
            description="The project’s working letter reference is available above."
          /> : <ContentState
            title="Editorial notes unavailable"
            description="The working conventions above remain available. Further notes could not be loaded right now."
          />}
        </section>
      </div>
      <aside className="side-note">
        <p className="eyebrow">Writing together</p>
        <h2>A working reference.</h2>
        <p>
          Long vowels are shown with doubled letters and their marked forms:
          <code> aa (ā)</code>, <code>ee (ē)</code>, and <code>oo (ō)</code>.
          The list also includes <code>(n)</code> and <code>‘l</code>.
        </p>
        <p>Sound descriptions are working labels for this project. Record pronunciation and usage notes as you develop each entry.</p>
      </aside>
    </div>
  );
}
