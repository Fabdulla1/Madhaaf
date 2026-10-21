"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readPublicApi } from "./content-api";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/family", label: "Family Tree" },
  { href: "/language", label: "Language" },
  { href: "/history", label: "History" },
];

export function PublicHeader() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    readPublicApi<{ admin: boolean }>("/api/auth/status", controller.signal)
      .then((result) => {
        if (result.status === "success") setIsAdmin(result.data.admin === true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const accountHref = isAdmin ? "/admin" : "/login";
  const accountLabel = isAdmin ? "Dashboard" : "Admin sign in";

  return (
    <header className="site-header">
      <div className="site-header__inner page-width">
        <Link className="wordmark" href="/" aria-label="Madhaaf, home">
          <span className="wordmark__symbol" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="wordmark__text">Madhaaf</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-signin" href={accountHref}>
          {accountLabel} <span aria-hidden="true">↗</span>
        </Link>
        <details className="mobile-nav">
          <summary>
            <span className="mobile-nav__open-label">Menu</span>
            <span className="mobile-nav__close-label">Close</span>
            <span aria-hidden="true">☰</span>
          </summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href={accountHref}>{accountLabel}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
