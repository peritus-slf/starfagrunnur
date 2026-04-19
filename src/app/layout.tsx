import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starfagrunnur",
  description:
    "Opinn gagnagrunnur um íslenskt starfakerfi, byggður á ÍSTARF21 og ESCO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is">
      <body>{children}</body>
    </html>
  );
}
