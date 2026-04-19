import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PeritusLogo } from "@/components/PeritusLogo";

export const metadata: Metadata = {
  title: "Um Starfagrunn — bakgrunnur og heimildir",
  description:
    "Um Starfagrunn: samþættur opinn gagnagrunnur um íslenskt starfakerfi sem tengir ÍSTARF21 við ESCO, evrópska starfaflokkunarkerfið.",
  alternates: { canonical: "/um" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-amber-dim">
            Um þjónustuna
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-tight text-text-primary">
            Um Starfagrunn
          </h1>
        </header>

        <section className="mb-10 space-y-4 text-[1.0625rem] font-light leading-[1.8] text-text-secondary">
          <p>
            Starfagrunnur er opinn gagnagrunnur og REST API sem sameinar{" "}
            <strong>ÍSTARF21</strong> — íslenska aðlögun ISCO-08 starfaflokkunarkerfisins —
            við <strong>ESCO</strong>, evrópska flokkunarkerfið fyrir störf, hæfni og færni.
          </p>
          <p>
            Tilgangurinn er að gera tenginguna á milli íslenskrar starfaflokkunar og
            alþjóðlegra hæfniskilgreininga aðgengilega í einu lagi, án API-lykils og án
            gjaldtöku. Hver sem er — einstaklingar, stjórnvöld, menntastofnanir, þróunaraðilar
            — getur notað gögnin til að svara spurningum á borð við <em>„hvaða hæfni þarf
            hjúkrunarfræðingur?“</em> eða <em>„hvaða störf falla undir starfaflokk 2221?“</em>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="label mb-4 block text-amber">Heimildir og leyfi</h2>
          <div className="space-y-4 text-sm font-light leading-relaxed text-text-secondary">
            <div className="border border-border-subtle bg-surface-raised px-5 py-4">
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-tertiary">
                ÍSTARF21
              </p>
              <p>
                Íslenska starfaflokkunarkerfið, gefið út af Hagstofu Íslands árið 2021.
                Byggt á alþjóðlega ISCO-08 staðlinum.{" "}
                <a
                  href="https://hagstofa.is"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-dim underline underline-offset-2 hover:text-amber"
                >
                  hagstofa.is
                </a>
              </p>
            </div>
            <div className="border border-border-subtle bg-surface-raised px-5 py-4">
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-tertiary">
                ESCO v1
              </p>
              <p>
                European Skills, Competences, Qualifications and Occupations. Framleitt og
                viðhaldið af framkvæmdastjórn Evrópusambandsins. Gefið út undir{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-dim underline underline-offset-2 hover:text-amber"
                >
                  CC BY 4.0
                </a>{" "}
                leyfi.{" "}
                <a
                  href="https://esco.ec.europa.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-dim underline underline-offset-2 hover:text-amber"
                >
                  esco.ec.europa.eu
                </a>
              </p>
            </div>
            <div className="border border-border-subtle bg-surface-raised px-5 py-4">
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-tertiary">
                Samþætting (þessi gagnagrunnur)
              </p>
              <p>
                Ritstjórn, tenging og hugbúnaður er gefið út undir{" "}
                <Link
                  href="https://github.com/peritus-slf/starfagrunnur/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-dim underline underline-offset-2 hover:text-amber"
                >
                  MIT
                </Link>{" "}
                leyfi. ESCO-efni heldur upprunalegri CC BY 4.0 tilvísun.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="label mb-4 block text-amber">Hvernig tengingin virkar</h2>
          <p className="mb-4 text-[0.9375rem] font-light leading-relaxed text-text-secondary">
            ÍSTARF21 og ESCO deila sameiginlegum grunni í{" "}
            <strong className="text-text-primary">ISCO-08</strong>. ESCO starfsheiti innihalda{" "}
            <code className="font-mono text-xs text-amber-dim">iscoGroup</code> eiginleika
            sem samsvarar 4. stigs ÍSTARF21 kóða. Með því að tengja á þeim kóða fáum við{" "}
            <strong className="text-text-primary">2.983 tengd starfsheiti</strong> undir 409
            íslenskum starfaflokkum. Hvert starfsheiti tengist svo mengi hæfnieininga — bæði
            dæmigerðra og viðbótar — samkvæmt ESCO skilgreiningunni.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="label mb-4 block text-amber">Umsjón og samband</h2>
          <p className="mb-4 text-[0.9375rem] font-light leading-relaxed text-text-secondary">
            Starfagrunnur er smíðaður og viðhaldinn af Peritus. Ábendingar, villutilkynningar
            og fyrirspurnir má senda á{" "}
            <a
              href="mailto:info@peritus.is"
              className="text-amber-dim underline underline-offset-2 hover:text-amber"
            >
              info@peritus.is
            </a>
            .
          </p>
          <div className="mt-6 flex items-center gap-4">
            <PeritusLogo className="text-text-secondary" width={120} />
          </div>
        </section>

        <section>
          <h2 className="label mb-4 block text-amber">Tenglar</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="text-text-secondary hover:text-amber">
                Forsíða og leit
              </Link>
            </li>
            <li>
              <Link href="/docs" className="text-text-secondary hover:text-amber">
                API skjölun (Swagger UI)
              </Link>
            </li>
            <li>
              <a
                href="/openapi.yaml"
                className="text-text-secondary hover:text-amber"
              >
                OpenAPI 3.1 forskrift
              </a>
            </li>
            <li>
              <a
                href="/llms.txt"
                className="text-text-secondary hover:text-amber"
              >
                llms.txt (fyrir AI-umboðsmenn)
              </a>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
