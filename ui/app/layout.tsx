import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Sidebar from "@/components/sidebar";
import { getOverview } from "@/lib/server/state";
import "./globals.css";

const fontUi = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui"
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Shogun UI Console",
  description: "YAML + tmux control panel"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const overview = await getOverview();

  return (
    <html lang="ja">
      <body className={`${fontUi.variable} ${fontMono.variable}`}>
        <Sidebar badges={overview.sidebar} />
        <main className="min-h-screen p-4 pt-16 md:ml-[var(--sidebar-width)] md:p-8 md:pt-8">{children}</main>
      </body>
    </html>
  );
}
