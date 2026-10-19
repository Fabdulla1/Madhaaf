import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        <div>
          <p className="footer-wordmark">Kutchi Roots</p>
          <p>
            A developing space for Mombasa Kutchi language, culture, and
            carefully preserved family memory.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/dictionary">Dictionary</Link>
          <Link href="/orthography">How we write Mombasa Kutchi</Link>
          <Link href="/history">History &amp; culture</Link>
          <Link href="/family">Private family space</Link>
        </nav>
        <p className="footer-note">
          This archive is growing. Entries and historical material are
          published only when reviewed.
        </p>
      </div>
    </footer>
  );
}
