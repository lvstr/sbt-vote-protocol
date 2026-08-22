import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SBT Vote Protocol",
  description: "Decentralized voting with Soulbound Tokens on Stellar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
