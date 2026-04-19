export default function Stats() {
  const cards = [
    {
      source: "ÍSTARF21",
      value: "578",
      label: "Starfaflokkar",
      breakdown: "9 bálkar · 39 deildir · 121 klasar · 409 starfaflokkar",
      description: "Íslenska starfaflokkunarkerfið í fjórum stigum",
    },
    {
      source: "ESCO",
      value: "3.039",
      label: "Starfsheiti",
      breakdown: "2.983 tengd ÍSTARF21 · 56 án tengingar",
      description: "Evrópsk starfsheiti flokkuð inn í ÍSTARF21",
    },
    {
      source: "ESCO",
      value: "13.939",
      label: "Hæfnieiningar",
      breakdown: "10.715 færni · 3.219 þekking",
      description: "Einstakar færni- og þekkingareiningar",
    },
    {
      source: "Graf",
      value: "126.051",
      label: "Tengingar",
      breakdown: "Dæmigerðar og viðbótar hæfnikröfur",
      description: "Starfsheiti → hæfni tengingar í grafinu",
    },
  ];

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
      </div>
    </section>
  );
}
