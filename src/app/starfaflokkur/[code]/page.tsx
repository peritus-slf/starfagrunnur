import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { runQuery } from "@/lib/neo4j";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Each ÍSTARF21 code gets its own static page. Next.js builds them at
// build time for every entry returned by generateStaticParams() and
// revalidates on a 24h cadence so a data reload is picked up automatically.
export const revalidate = 86400; // 24h
export const dynamicParams = true; // allow on-demand rendering of unknown codes

interface GroupDetail {
  code: string;
  title: string;
  level: number;
  description: string | null;
  tasks: string[] | null;
  example_titles: string[] | null;
  parent_code: string | null;
  parent_title: string | null;
}

interface Ancestor {
  code: string;
  title: string;
  level: number;
}

interface EscoOcc {
  conceptUri: string;
  preferredLabel_is: string;
  description_is: string | null;
  iscoGroup: string;
}

interface SkillItem {
  preferredLabel_is: string;
  skillType: string;
  relationType: string;
  description_is: string | null;
}

async function fetchGroup(code: string): Promise<GroupDetail | null> {
  const rows = await runQuery<GroupDetail>(
    `MATCH (g:OccupationGroup {code: $code})
     OPTIONAL MATCH (g)-[:CHILD_OF]->(parent:OccupationGroup)
     RETURN g.code AS code,
            g.title AS title,
            g.level AS level,
            g.description_is AS description,
            g.tasks AS tasks,
            g.example_titles AS example_titles,
            parent.code AS parent_code,
            parent.title AS parent_title`,
    { code }
  );
  return rows[0] ?? null;
}

async function fetchAncestors(code: string): Promise<Ancestor[]> {
  return runQuery<Ancestor>(
    `MATCH (g:OccupationGroup {code: $code})
     MATCH path = (g)-[:CHILD_OF*1..4]->(a:OccupationGroup)
     WITH a, length(path) AS d ORDER BY d ASC
     RETURN a.code AS code, a.title AS title, a.level AS level`,
    { code }
  );
}

async function fetchEscoRoles(code: string): Promise<EscoOcc[]> {
  return runQuery<EscoOcc>(
    `MATCH (g:OccupationGroup {code: $code})<-[:BELONGS_TO_GROUP]-(occ:EscoOccupation)
     RETURN occ.conceptUri AS conceptUri,
            occ.preferredLabel_is AS preferredLabel_is,
            occ.description_is AS description_is,
            occ.iscoGroup AS iscoGroup
     ORDER BY occ.preferredLabel_is`,
    { code }
  );
}

async function fetchSkills(code: string): Promise<SkillItem[]> {
  return runQuery<SkillItem>(
    `MATCH (g:OccupationGroup {code: $code})<-[:BELONGS_TO_GROUP]-(occ:EscoOccupation)
       -[r:REQUIRES_SKILL]->(s:Skill)
     WITH DISTINCT s.preferredLabel_is AS preferredLabel_is,
                   s.skillType AS skillType,
                   s.description_is AS description_is,
                   r.relationType AS relationType
     ORDER BY relationType, preferredLabel_is
     RETURN preferredLabel_is, skillType, description_is, relationType
     LIMIT 200`,
    { code }
  );
}

export async function generateStaticParams() {
  try {
    const rows = await runQuery<{ code: string }>(
      `MATCH (g:OccupationGroup) RETURN g.code AS code ORDER BY g.code`
    );
    return rows.map((r) => ({ code: r.code }));
  } catch {
    // Neo4j unavailable at build time — skip prerender, fall back to on-demand.
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params;
  if (!/^\d{1,4}$/.test(code)) return { title: "Ógildur kóði" };
  const group = await fetchGroup(code).catch(() => null);
  if (!group) return { title: `Starfaflokkur ${code} — ekki fundinn` };
  return {
    title: `${group.code} ${group.title} — Starfagrunnur`,
    description:
      group.description ??
      `Starfaflokkur ${group.code} (${group.title}) í ÍSTARF21 flokkunarkerfinu. Sjá tengd ESCO starfsheiti og tilheyrandi hæfni.`,
    alternates: { canonical: `/starfaflokkur/${group.code}` },
  };
}

function levelName(level: number): string {
  switch (level) {
    case 1: return "bálkur";
    case 2: return "deild";
    case 3: return "klasi";
    case 4: return "starfaflokkur";
    default: return "flokkur";
  }
}

export default async function OccupationPage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!/^\d{1,4}$/.test(code)) notFound();

  const group = await fetchGroup(code);
  if (!group) notFound();

  const [ancestors, escoRoles, skills] = await Promise.all([
    fetchAncestors(code),
    fetchEscoRoles(code),
    fetchSkills(code),
  ]);

  const essential = skills.filter((s) => s.relationType === "essential");
  const optional = skills.filter((s) => s.relationType === "optional");

  // BreadcrumbList JSON-LD (ancestors are closest-first → reverse for trail)
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Starfagrunnur",
        item: "https://starfagrunnur.is",
      },
      ...ancestors
        .slice()
        .reverse()
        .map((a, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: `${a.code} ${a.title}`,
          item: `https://starfagrunnur.is/starfaflokkur/${a.code}`,
        })),
      {
        "@type": "ListItem",
        position: ancestors.length + 2,
        name: `${group.code} ${group.title}`,
        item: `https://starfagrunnur.is/starfaflokkur/${group.code}`,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Breadcrumb trail */}
        {ancestors.length > 0 && (
          <nav aria-label="Staðsetning í flokkun" className="mb-8 text-xs text-text-tertiary">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-amber">
                  Starfagrunnur
                </Link>
              </li>
              {ancestors
                .slice()
                .reverse()
                .map((a) => (
                  <li key={a.code} className="flex items-center gap-1">
                    <span>/</span>
                    <Link
                      href={`/starfaflokkur/${a.code}`}
                      className="hover:text-amber"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              <li className="flex items-center gap-1">
                <span>/</span>
                <span className="text-text-secondary">{group.title}</span>
              </li>
            </ol>
          </nav>
        )}

        {/* Title block */}
        <header className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-amber-dim">
            ÍSTARF21 · Stig {group.level} · {levelName(group.level)}
          </p>
          <div className="mb-3 flex items-baseline gap-4">
            <span className="font-mono text-lg text-amber">{group.code}</span>
            <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-tight text-text-primary">
              {group.title}
            </h1>
          </div>
        </header>

        {/* Description */}
        {group.description && (
          <section className="mb-10 border-l-2 border-amber/40 bg-surface-raised px-6 py-5">
            <p className="text-[1.0625rem] font-light leading-[1.75] text-text-secondary">
              {group.description}
            </p>
          </section>
        )}

        {/* Tasks (level-4 only) */}
        {group.tasks && group.tasks.length > 0 && (
          <section className="mb-10">
            <h2 className="label mb-4 block text-amber">Verkefni</h2>
            <ul className="space-y-2">
              {group.tasks.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[0.9375rem] font-light leading-relaxed text-text-secondary"
                >
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 bg-amber-dim" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Example titles */}
        {group.example_titles && group.example_titles.length > 0 && (
          <section className="mb-10">
            <h2 className="label mb-3 block text-text-tertiary">Dæmi um starfsheiti</h2>
            <div className="flex flex-wrap gap-2">
              {group.example_titles.map((t) => (
                <span
                  key={t}
                  className="border border-border-subtle bg-surface-raised px-3 py-1 text-sm font-light text-text-secondary"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ESCO roles */}
        {escoRoles.length > 0 && (
          <section className="mb-10">
            <h2 className="label mb-4 block text-amber">
              ESCO starfsheiti ({escoRoles.length})
            </h2>
            <div className="grid gap-3">
              {escoRoles.map((e) => (
                <article
                  key={e.conceptUri}
                  className="border border-border-subtle bg-surface-raised px-5 py-4"
                >
                  <h3 className="text-base font-medium text-text-primary">
                    {e.preferredLabel_is}
                  </h3>
                  <p className="mt-1 font-mono text-[0.6875rem] text-text-tertiary">
                    ISCO {e.iscoGroup}
                  </p>
                  {e.description_is && (
                    <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                      {e.description_is}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-10">
            <h2 className="label mb-2 block text-amber">Hæfni</h2>
            <p className="mb-4 text-xs font-light leading-relaxed text-text-tertiary">
              ESCO flokkar hæfni sem dæmigerða eða viðbótar fyrir starfsheiti. Einstakir
              starfsmenn hafa yfirleitt hluta af listanum — sniðinn að sérhæfingu og
              vinnuveitanda.
            </p>
            {essential.length > 0 && (
              <div className="mb-6">
                <p className="label-sm mb-2 text-text-tertiary">Dæmigerð ({essential.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {essential.map((s) => (
                    <span
                      key={s.preferredLabel_is}
                      title={s.description_is ?? undefined}
                      className="inline-block border border-amber/30 bg-amber/5 px-2.5 py-1 text-xs font-light text-amber-bright"
                    >
                      {s.preferredLabel_is}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {optional.length > 0 && (
              <div>
                <p className="label-sm mb-2 text-text-tertiary">Viðbótar ({optional.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {optional.map((s) => (
                    <span
                      key={s.preferredLabel_is}
                      title={s.description_is ?? undefined}
                      className="inline-block border border-border-default bg-surface-overlay px-2.5 py-1 text-xs font-light text-text-secondary"
                    >
                      {s.preferredLabel_is}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* API cross-reference */}
        <section className="mt-12 border-t border-border-faint pt-6">
          <p className="label-sm mb-2 text-text-tertiary">Aðgangur um API</p>
          <p className="font-mono text-xs text-text-secondary break-all">
            <Link
              href={`/api/v1/occupations/${group.code}`}
              className="text-amber-dim hover:text-amber"
            >
              GET /api/v1/occupations/{group.code}
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
