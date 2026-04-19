export default function Hero() {
  const heroCards = [
    { source: "ÍSTARF21", value: "578", label: "Starfaflokkar" },
    { source: "ESCO", value: "3.039", label: "Starfsheiti" },
    { source: "ÍSTARF21", value: "4", label: "Flokkunarstig" },
    { source: "ESCO", value: "126k", label: "Tengingar" },
  ];
  return (
    <section
      className="border-b px-6 py-20 md:py-28"
      style={{
        background: "var(--hero-bg)",
        borderColor: "var(--hero-border-subtle)",
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:gap-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8" style={{ background: "var(--hero-amber)" }} />
            <span className="label" style={{ color: "var(--hero-amber)" }}>Opinn gagnagrunnur</span>
          </div>

          <h1
            className="mb-6 font-display text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.1]"
            style={{ color: "var(--hero-text)" }}
          >
            Starfagrunnur{" "}
            <em style={{ color: "var(--hero-amber)" }}>íslenska</em>{" "}
            starfakerfisins
          </h1>

          <p
            className="mb-10 max-w-lg text-[1.0625rem] font-light leading-[1.75]"
            style={{ color: "var(--hero-text-secondary)", fontFamily: "var(--font-body), Georgia, serif" }}
          >
            Leitaðu, skoðaðu og tengdu starfaflokka við hæfni og færni.
            Byggt á ÍSTARF21 og ESCO staðlinum, aðgengilegt gegnum
            opið REST API.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#search"
              className="inline-flex items-center px-6 py-3 font-mono text-[0.8125rem] font-medium uppercase tracking-wider transition-colors"
              style={{
                border: "1px solid var(--hero-amber)",
                background: "rgba(201, 168, 76, 0.1)",
                color: "var(--hero-amber)",
              }}
            >
              Leita
            </a>
            <a
              href="#api"
              className="inline-flex items-center px-6 py-3 font-mono text-[0.8125rem] font-medium uppercase tracking-wider transition-colors"
              style={{
                border: "1px solid var(--hero-border-subtle)",
                color: "var(--hero-text-secondary)",
              }}
            >
              API skjölun
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-8">
          <blockquote className="py-2 pl-6" style={{ borderLeft: "2px solid var(--hero-amber)" }}>
            <p className="font-display text-lg italic leading-relaxed" style={{ color: "var(--hero-text-secondary)" }}>
              &bdquo;Skipulagt yfirlit yfir allar starfagreinar á Íslandi,
              tengt alþjóðlegum hæfnikröfum.&ldquo;
            </p>
          </blockquote>

          <div
            className="grid grid-cols-2 gap-px"
            style={{ border: "1px solid var(--hero-border-subtle)", background: "var(--hero-border-subtle)" }}
          >
            {heroCards.map((item) => (
              <div
                key={item.label}
                className="px-5 py-4"
                style={{ background: "var(--hero-surface-raised)" }}
              >
                <span className="label-sm" style={{ color: "var(--hero-amber-dim)" }}>{item.source}</span>
                <p className="font-display text-2xl font-semibold" style={{ color: "var(--hero-text)" }}>
                  {item.value}
                </p>
                <span className="label-sm" style={{ color: "var(--hero-text-tertiary)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
