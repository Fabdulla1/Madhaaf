import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Madhaaf",
    template: "%s | Madhaaf",
  },
  description:
    "An academic research archive documenting Mombasa and Ethiopian Kutchi language, history and culture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
