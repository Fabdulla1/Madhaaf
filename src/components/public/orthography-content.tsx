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
            These conventions are being evaluated against speaker-supplied
            words and sentences. This draft has not been adopted as an
            official community or academic standard.
          </p>
        </div>
        <section className="orthography-rules">
          <h2>Letters and intended use</h2>
          <p>
            This letter reference is used for transcribing Kutchi examples.
            Apostrophes, vowel marks and <code>(n)</code> are retained where
            they preserve distinctions found in the original material.
          </p>
          <LetterReferenceTable />
        </section>
        <section className="orthography-editorial">
          <h2>Published editorial notes</h2>
          <p>Editorial notes explain revisions to the writing conventions and document points that still need speaker confirmation.</p>
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
        <p className="eyebrow">Transcription notes</p>
        <h2>Still developing.</h2>
        <p>
          Long vowels are shown with doubled letters and their marked forms:
          <code> aa (ā)</code>, <code>ee (ē)</code>, and <code>oo (ō)</code>.
          The list also includes <code>(n)</code> and <code>‘l</code>.
        </p>
        <p>The sound labels are provisional. Audio recordings and additional usage examples are needed to test and refine them.</p>
      </aside>
    </div>
  );
}
