type EndpointGroup = {
  title: string;
  endpoints: {
    method: string;
    path: string;
    params: string[];
    description: string;
  }[];
};

const groups: EndpointGroup[] = [
  {
    title: "Leit",
    endpoints: [
      {
        method: "GET",
        path: "/search",
        params: ["q"],
        description: "Leita yfir ÍSTARF21 flokka, ESCO starfsheiti og samheiti",
      },
    ],
  },
  {
    title: "ÍSTARF21 flokkar",
    endpoints: [
      {
        method: "GET",
        path: "/occupations",
        params: ["level", "parent", "limit", "offset"],
        description: "Listi flokka — síaður eftir stigi eða yfirflokki",
      },
      {
        method: "GET",
        path: "/occupations/{code}",
        params: ["code"],
        description: "Upplýsingar um tiltekinn starfaflokk",
      },
      {
        method: "GET",
        path: "/occupations/{code}/ancestors",
        params: ["code"],
        description: "Yfirflokkar upp í bálk",
      },
      {
        method: "GET",
        path: "/occupations/{code}/children",
        params: ["code"],
        description: "Beinir undirflokkar (eitt stig niður)",
      },
      {
        method: "GET",
        path: "/occupations/{code}/descendants",
        params: ["code", "level"],
        description: "Allir undirflokkar — valfrjálst síað eftir stigi",
      },
      {
        method: "GET",
        path: "/occupations/{code}/related",
        params: ["code"],
        description: "Skyldir flokkar",
      },
    ],
  },
  {
    title: "Tengingar við ESCO",
    endpoints: [
      {
        method: "GET",
        path: "/occupations/{code}/esco",
        params: ["code", "recursive"],
        description: "ESCO starfsheiti í flokki (recursive=true fer niður í stig 4)",
      },
      {
        method: "GET",
        path: "/occupations/{code}/skills",
        params: ["code", "occupation", "relation_type", "skill_type", "page"],
        description: "Hæfni — samansafn eða síað á einstakt ESCO starfsheiti",
      },
    ],
  },
  {
    title: "ESCO starfsheiti",
    endpoints: [
      {
        method: "GET",
        path: "/esco-occupations",
        params: ["q", "isco_group", "in_istarf21", "limit", "offset"],
        description: "Listi/leit að ESCO starfsheitum — valfrjálst síað eftir ISCO eða ÍSTARF21",
      },
      {
        method: "GET",
        path: "/esco-occupations/{uuid}",
        params: ["uuid"],
        description: "Starfsheiti: lýsing, ISCO, forflokkar, hæfnifjöldi",
      },
      {
        method: "GET",
        path: "/esco-occupations/{uuid}/skills",
        params: ["uuid", "relation_type", "skill_type", "page"],
        description: "Hæfnilisti fyrir tiltekið ESCO starfsheiti",
      },
    ],
  },
  {
    title: "Hæfni",
    endpoints: [
      {
        method: "GET",
        path: "/skills",
        params: ["q", "skill_type", "limit", "offset"],
        description: "Listi/leit að hæfnieiningum",
      },
      {
        method: "GET",
        path: "/skills/{uuid}",
        params: ["uuid"],
        description: "Hæfni: lýsing, tegund, fjöldi starfsheita sem nota hana",
      },
      {
        method: "GET",
        path: "/skills/{uuid}/occupations",
        params: ["uuid", "relation_type", "page"],
        description: "Starfsheiti sem krefjast þessarar hæfni (öfug uppfletting)",
      },
    ],
  },
];

export default function ApiDocs() {
  return (
    <section id="api" className="border-b border-border-faint px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: intro */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-amber" />
            <span className="label text-amber">REST API</span>
          </div>

          <h2 className="mb-6 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight text-text-primary">
            Opið og aðgengilegt
          </h2>

          <p className="mb-8 text-[1.0625rem] font-light leading-[1.75] text-text-secondary">
            Allar upplýsingar eru aðgengilegar gegnum einfalt REST API.
            Enginn API-lykill er nauðsynlegur &mdash; opið öllum til notkunar.
          </p>

          {/* Format info */}
          <div className="mb-8 border border-border-subtle bg-surface-raised px-5 py-4">
            <span className="label text-text-tertiary">Snið</span>
            <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
              Öll svör eru á JSON-sniði, kóðuð í UTF-8.
              Skoðunarsvör eru síðutæmuð og valfrjálst síuð með fyrirspurnabreytum.
            </p>
          </div>

          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-amber bg-amber/10 px-5 py-3 font-mono text-[0.8125rem] uppercase tracking-wider text-amber transition-colors hover:bg-amber/20"
          >
            Swagger skjölun
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="square"
                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
              />
            </svg>
          </a>
        </div>

        {/* Right: endpoints */}
        <div className="border border-border-subtle bg-surface-raised">
          <div className="border-b border-border-subtle px-5 py-3">
            <span className="label text-text-tertiary">
              API v1 &mdash; Endapunktar
            </span>
          </div>

          <div>
            {groups.map((group) => (
              <div key={group.title}>
                <div className="border-b border-t border-border-subtle bg-surface-base/40 px-5 py-2">
                  <span className="label-sm text-amber-dim">
                    {group.title}
                  </span>
                </div>
                <div className="divide-y divide-border-faint">
                  {group.endpoints.map((ep) => (
                    <div key={ep.path} className="px-5 py-4">
                      <div className="mb-2 flex items-start gap-3">
                        <span className="mt-0.5 inline-block border border-teal bg-teal/10 px-2 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-wider text-teal-bright">
                          {ep.method}
                        </span>
                        <code className="font-mono text-sm text-text-primary">
                          /api/v1
                          {ep.path.split(/(\{[^}]+\})/).map((part, i) =>
                            part.startsWith("{") ? (
                              <span key={i} className="text-amber">
                                {part}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </code>
                      </div>
                      <p className="mb-2 text-sm font-light text-text-secondary">
                        {ep.description}
                      </p>
                      {ep.params.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ep.params.map((param) => (
                            <span
                              key={param}
                              className="inline-block border border-border-subtle px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider text-text-tertiary"
                            >
                              {param}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
