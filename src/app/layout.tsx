import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, DM_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://starfagrunnur.is"),
  title: {
    default: "Starfagrunnur — Opinn gagnagrunnur um störf og hæfni",
    template: "%s",
  },
  description:
    "Starfagrunnur er opinn gagnagrunnur og API um íslenskt starfakerfi, byggður á ÍSTARF21 og ESCO. Leitaðu, skoðaðu og tengdu starfaflokka, hæfni og færni.",
  keywords: [
    "starfagrunnur",
    "ÍSTARF21",
    "ESCO",
    "störf",
    "hæfni",
    "API",
    "Ísland",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="is"
      className={`${playfair.variable} ${sourceSerif.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("starfagrunnur-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
