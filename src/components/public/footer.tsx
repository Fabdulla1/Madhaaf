import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        <div>
          <p className="footer-wordmark">Madhaaf</p>
          <p>
            A developing space for Mombasa Kutchi language, culture, and
            carefully preserved family memory.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/language">Language</Link>
          <Link href="/dictionary">Dictionary</Link>
          <Link href="/language/grammar">Grammar</Link>
          <Link href="/language/articles">Research articles</Link>
          <Link href="/orthography">Writing guide</Link>
          <Link href="/history">History &amp; culture</Link>
          <Link href="/family">Family space</Link>
        </nav>
        <p className="footer-note">
          This archive is growing. Entries and historical material are
          published only when reviewed.
        </p>
      </div>
      <div className="page-width footer-support">
        <span>Supported by</span>
        <a href="https://www.tokenworks.ai/" rel="noopener noreferrer">
          <Image src="/tokenworks-logo.png" width={44} height={44} alt="" />
          TokenWorks
        </a>
      </div>
    </footer>
  );
}
