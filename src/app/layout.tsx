import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Madhaaf",
    template: "%s | Madhaaf",
  },
  description:
    "A living archive of Kutchi language, family histories, and cultural memory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
