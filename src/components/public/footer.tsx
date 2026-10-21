import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        <div>
          <p className="footer-wordmark">Madhaaf</p>
          <p>
            Academic research and documentation of Mombasa and Ethiopian
            Kutchi language, cultural history and community records.
            Founded by Farhan Abdulla.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/language">Language</Link>
          <Link href="/dictionary">Dictionary</Link>
          <Link href="/language/grammar">Grammar</Link>
          <Link href="/language/articles">Research articles</Link>
          <Link href="/orthography">Writing guide</Link>
          <Link href="/history">History &amp; culture</Link>
          <Link href="/about">About Madhaaf</Link>
          <Link href="/family">Family space</Link>
        </nav>
        <p className="footer-note">
          Published records distinguish original sources from interpretations.
          Research findings remain open to revision.
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
