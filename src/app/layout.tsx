import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kutchi Roots — Mombasa",
    template: "%s | Kutchi Roots",
  },
  description:
    "A developing archive for Mombasa Kutchi words, family histories, and cultural memory.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
