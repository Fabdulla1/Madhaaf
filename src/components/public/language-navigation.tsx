import Link from "next/link";

const sections = [
  { href: "/language", label: "Overview", key: "overview" },
  { href: "/dictionary", label: "Dictionary", key: "dictionary" },
  { href: "/language/grammar", label: "Grammar", key: "grammar" },
  { href: "/orthography", label: "Writing guide", key: "writing" },
] as const;

export type LanguageSection = (typeof sections)[number]["key"];

export function LanguageNavigation({ active }: { active: LanguageSection }) {
  return (
    <nav className="language-nav" aria-label="Language sections">
      {sections.map((section) => (
        <Link
          href={section.href}
          key={section.key}
          className={active === section.key ? "is-current" : undefined}
          aria-current={active === section.key ? "page" : undefined}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
