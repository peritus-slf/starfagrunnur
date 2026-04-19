import { getStats, formatCount } from "@/lib/stats";

function ucFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function Stats() {
  const data = await getStats();

  const byLevel = data.occupation_groups.by_level;
  const level1 = byLevel["1"] ?? 0;
  const level2 = byLevel["2"] ?? 0;
  const level3 = byLevel["3"] ?? 0;
  const level4 = byLevel["4"] ?? 0;

  const competence = data.skills.by_type["skill/competence"] ?? 0;
  const knowledge = data.skills.by_type["knowledge"] ?? 0;

  const essential = data.requires_skill.by_relation_type["essential"] ?? 0;
  const optional = data.requires_skill.by_relation_type["optional"] ?? 0;

  const esco = data.esco_occupations;

  const cards = [
    {
      source: "ÍSTARF21",
      value: formatCount(data.occupation_groups.total),
      label: "Starfaflokkar",
      breakdown: `${level1} bálkar · ${level2} deildir · ${level3} klasar · ${level4} starfaflokkar`,
      description: "Íslenska starfaflokkunarkerfið í fjórum stigum",
    },
    {
      source: "ESCO",
      value: formatCount(esco.total),
      label: "Starfsheiti",
      breakdown: `${formatCount(esco.bridged_to_istarf21)} tengd ÍSTARF21 · ${formatCount(esco.without_istarf21_bridge)} án tengingar`,
      description: "Evrópsk starfsheiti flokkuð inn í ÍSTARF21",
    },
    {
      source: "ESCO",
      value: formatCount(data.skills.total),
      label: "Hæfnieiningar",
      breakdown: `${formatCount(competence)} færni · ${formatCount(knowledge)} þekking`,
      description: "Einstakar færni- og þekkingareiningar",
    },
    {
      source: "Graf",
      value: formatCount(data.requires_skill.total),
      label: "Tengingar",
      breakdown: `${formatCount(essential)} dæmigerðar · ${formatCount(optional)} viðbótar`,
      description: "Starfsheiti → hæfni tengingar í grafinu",
    },
  ];

  const generated =
    data.generated_at && data.generated_at !== "1970-01-01T00:00:00.000Z"
      ? new Date(data.generated_at)
      : null;

  return (
    <section id="stats" className="border-b border-border-faint px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-amber" />
          <h2 className="label text-amber">Gagnagrunnur</h2>
        </div>

        <div className="grid gap-px border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-surface-base px-6 py-8 transition-colors hover:bg-surface-raised"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-transparent transition-colors group-hover:bg-amber" />

              <span className="label-sm text-amber-dim">{stat.source}</span>
              <p className="mt-2 font-display text-[clamp(2rem,3vw,3rem)] font-bold leading-none text-text-primary">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-text-secondary">
                {stat.label}
              </p>
              <p className="mt-3 text-xs font-light leading-relaxed text-text-secondary">
                {stat.breakdown}
              </p>
              <p className="mt-2 text-sm font-light leading-relaxed text-text-tertiary">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {generated && (
          <p className="mt-6 text-right font-mono text-[0.6875rem] text-text-tertiary">
            Síðast uppfært:{" "}
            <time dateTime={generated.toISOString()}>
              {ucFirst(
                new Intl.DateTimeFormat("is-IS", {
                  dateStyle: "long",
                }).format(generated)
              )}
            </time>
          </p>
        )}
      </div>
    </section>
  );
}
