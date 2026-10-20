import Link from "next/link";
import { letterReference } from "@/lib/orthography";

export function LetterReferenceTable() {
  return (
    <table className="letter-reference-table">
      <caption className="sr-only">Kutchi letters and intended use</caption>
      <thead>
        <tr><th scope="col">Letters</th><th scope="col">Intended use</th></tr>
      </thead>
      <tbody>
        {letterReference.map(({ letters, use }) => (
          <tr key={letters}>
            <th scope="row"><code>{letters}</code></th>
            <td>{use}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function WritingReference() {
  return (
    <details className="writing-reference">
      <summary>Letter reference <span>— Kutchi writing guide</span></summary>
      <div className="writing-reference__content">
        <p>
          Use this working list for words, spelling variants, and examples.
          Preserve apostrophes, vowel marks, and <code>(n)</code> exactly as written.
        </p>
        <LetterReferenceTable />
        <Link href="/orthography" target="_blank" rel="noopener noreferrer">
          Open the full writing guide (new tab)
        </Link>
      </div>
    </details>
  );
}
