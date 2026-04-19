"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  SearchResult,
  OccupationDetail,
  SkillItem,
  SkillsResponse,
  OccupationGroupSummary,
  EscoOccupation,
} from "@/lib/types";
import {
  searchOccupations,
  getOccupation,
  getSkills,
  getAncestors,
  getRelated,
  getEscoOccupations,
} from "@/lib/api";

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [focusedEscoTitle, setFocusedEscoTitle] = useState<string | null>(null);
  const [detail, setDetail] = useState<OccupationDetail | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [ancestors, setAncestors] = useState<OccupationGroupSummary[]>([]);
  const [related, setRelated] = useState<OccupationGroupSummary[]>([]);
  const [escoOccupations, setEscoOccupations] = useState<EscoOccupation[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [skillTab, setSkillTab] = useState<"essential" | "optional">(
    "essential"
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotalResults(0);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);
    try {
      const data = await searchOccupations(q);
      setResults(data.results);
      setTotalResults(data.total);
    } catch {
      setSearchError("Villa kom upp við leit. Reyndu aftur.");
      setResults([]);
      setTotalResults(0);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 300);
  };

  const handleSelect = useCallback(async (code: string, focusEscoTitle: string | null = null) => {
    setSelectedCode(code);
    setFocusedEscoTitle(focusEscoTitle);
    setLoadingDetail(true);
    setDetailError(null);
    setDetail(null);
    setSkills([]);
    setAncestors([]);
    setRelated([]);
    setEscoOccupations([]);
    setSkillTab("essential");

    try {
      const [occupationData, skillsData, ancestorsData, relatedData, escoData] =
        await Promise.all([
          getOccupation(code),
          getSkills(code, 1, 100).catch(() => ({ items: [], total: 0, page: 1, page_size: 100, total_pages: 0 }) as SkillsResponse),
          getAncestors(code).catch(() => [] as OccupationGroupSummary[]),
          getRelated(code).catch(() => [] as OccupationGroupSummary[]),
          getEscoOccupations(code).catch(() => [] as EscoOccupation[]),
        ]);

      setDetail(occupationData);

      // Deduplicate skills by preferredLabel_is
      const seen = new Set<string>();
      const uniqueSkills = skillsData.items.filter((s) => {
        if (seen.has(s.preferredLabel_is)) return false;
        seen.add(s.preferredLabel_is);
        return true;
      });
      setSkills(uniqueSkills);
      setAncestors(ancestorsData);
      setRelated(relatedData);
      setEscoOccupations(escoData);
    } catch {
      setDetailError("Villa kom upp við að sækja upplýsingar.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const essentialSkills = skills.filter(
    (s) => s.relationType === "essential"
  );
  const optionalSkills = skills.filter(
    (s) => s.relationType === "optional"
  );

  return (
    <section id="search" className="border-b border-border-faint px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-amber" />
          <span className="label text-amber">Leit</span>
        </div>

        <h2 className="mb-8 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight text-text-primary">
          Skoða störf og flokka
        </h2>

        {/* Search input */}
        <div className="relative mb-8">
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="square"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Leita eftir starfsheiti eða kóða…"
            className="w-full border border-border-default bg-surface-raised py-3.5 pl-12 pr-4 font-body text-base text-text-primary placeholder:text-text-tertiary focus:border-amber focus:outline-none"
          />
          {searching && (
            <span className="label absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              Leitar…
            </span>
          )}
        </div>

        {searchError && (
          <p className="mb-4 text-sm text-red-400">{searchError}</p>
        )}

        {/* Two-panel layout */}
        {(results.length > 0 || selectedCode) && (
          <div className="flex flex-col border border-border-subtle bg-surface-raised md:flex-row">
            {/* Results list */}
            <div className="w-full shrink-0 overflow-y-auto border-b border-border-subtle max-h-[320px] md:w-[280px] md:max-h-[600px] md:border-b-0 md:border-r">
              {results.length > 0 && (
                <div className="border-b border-border-subtle px-4 py-2">
                  <span className="label-sm text-text-tertiary">
                    {totalResults} {totalResults === 1 ? "niðurstaða" : "niðurstöður"}
                  </span>
                </div>
              )}
              {results.map((r, i) => {
                const isEsco = r.result_type === "esco";
                const key = isEsco
                  ? `esco-${r.group_code ?? ""}-${r.title}-${i}`
                  : `istarf-${r.code}`;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(r.code, isEsco ? r.title : null)}
                    className={`block w-full border-b border-border-faint px-4 py-3 text-left transition-colors hover:bg-surface-overlay ${
                      selectedCode === r.code
                        ? "border-l-2 border-l-amber bg-surface-overlay"
                        : ""
                    }`}
                  >
                    {isEsco ? (
                      <>
                        <span className="font-mono text-[0.6875rem] text-amber-dim">
                          STARFSHEITI
                        </span>
                        <p className="text-sm font-medium text-text-primary">
                          {r.title}
                        </p>
                        <span className="label-sm text-text-tertiary">
                          í {r.group_code} {r.group_title}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-[0.6875rem] text-amber-dim">
                          {r.code}
                        </span>
                        <p className="text-sm font-medium text-text-primary">
                          {r.title}
                        </p>
                        <span className="label-sm text-text-tertiary">
                          Stig {r.level} &middot; ÍSTARF
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            <div className="min-w-0 flex-1 overflow-y-auto p-4 md:max-h-[600px] md:p-6">
              {!selectedCode && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-tertiary">
                    Veldu starfaflokk til að sjá upplýsingar
                  </p>
                </div>
              )}

              {loadingDetail && (
                <div className="flex h-full items-center justify-center">
                  <p className="label text-text-tertiary">Hleð...</p>
                </div>
              )}

              {detailError && (
                <p className="text-sm text-red-400">{detailError}</p>
              )}

              {(() => {
                const focusedEsco =
                  focusedEscoTitle
                    ? escoOccupations.find(
                        (e) => e.preferredLabel_is === focusedEscoTitle
                      ) ?? null
                    : null;
                return detail && !loadingDetail && (
                <div className="space-y-6">
                  {/* Focused ESCO role (when a role was clicked in search results) */}
                  {focusedEsco && (
                    <div className="border-l-2 border-amber bg-amber/5 px-4 py-4">
                      <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-amber-dim">
                        Starfsheiti · ESCO
                      </span>
                      <h3 className="mt-1 font-display text-xl font-bold text-text-primary">
                        {focusedEsco.preferredLabel_is}
                      </h3>
                      <span className="label-sm text-text-tertiary">
                        ISCO {focusedEsco.iscoGroup}
                      </span>
                      {focusedEsco.description_is && (
                        <p className="mt-3 text-[0.9375rem] font-light leading-relaxed text-text-secondary">
                          {focusedEsco.description_is}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-text-tertiary">
                        Flokkað sem <span className="text-text-secondary">{detail.code} {detail.title}</span> í ÍSTARF21 — sjá flokksupplýsingar hér að neðan.
                      </p>

                      {/* Skill preview for this specific ESCO role */}
                      {(() => {
                        const roleSkills = skills.filter(
                          (s) => s.occupation === focusedEsco.preferredLabel_is
                        );
                        const essential = roleSkills.filter((s) => s.relationType === "essential");
                        const preview = essential.slice(0, 8);
                        if (preview.length === 0) return null;
                        const apiUrl = `/api/v1/occupations/${detail.code}/skills?occupation=${encodeURIComponent(focusedEsco.preferredLabel_is)}&page_size=200`;
                        return (
                          <div className="mt-4 border-t border-amber/20 pt-4">
                            <span className="label-sm mb-2 block text-text-tertiary">
                              Dæmigerð hæfni ({essential.length}) — sýnishorn
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {preview.map((s) => (
                                <span
                                  key={s.preferredLabel_is}
                                  title={s.description_is}
                                  className="inline-block border border-amber/30 bg-amber/5 px-2.5 py-1 text-xs font-light text-amber-bright"
                                >
                                  {s.preferredLabel_is}
                                </span>
                              ))}
                              {essential.length > preview.length && (
                                <span className="inline-block px-2.5 py-1 text-xs font-light text-text-tertiary">
                                  +{essential.length - preview.length} til viðbótar
                                </span>
                              )}
                            </div>
                            <p className="mt-3 font-mono text-[0.6875rem] text-text-tertiary break-all">
                              Heildarlisti:{" "}
                              <a
                                href={apiUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-dim underline underline-offset-2 hover:text-amber"
                              >
                                GET {apiUrl}
                              </a>
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Breadcrumb */}
                  {ancestors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      {ancestors.map((a, i) => (
                        <span key={a.code} className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelect(a.code)}
                            className="text-text-tertiary transition-colors hover:text-amber"
                          >
                            {a.title}
                          </button>
                          {i < ancestors.length - 1 && (
                            <span className="text-text-tertiary">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <span className="font-mono text-xs text-amber-dim">
                      {detail.code}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-text-primary">
                      {detail.title}
                    </h3>
                    <span className="label-sm text-text-tertiary">
                      {detail.source_system} &middot; Stig {detail.level}
                    </span>
                  </div>

                  {/* Description */}
                  {detail.description && (
                    <div>
                      <span className="label mb-2 block text-text-tertiary">
                        Lýsing
                      </span>
                      <p className="text-[0.9375rem] font-light leading-relaxed text-text-secondary">
                        {detail.description}
                      </p>
                    </div>
                  )}

                  {/* Tasks */}
                  {detail.tasks && detail.tasks.length > 0 && (
                    <div>
                      <span className="label mb-2 block text-text-tertiary">
                        Verkefni
                      </span>
                      <ul className="space-y-1.5">
                        {detail.tasks.map((task, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm font-light text-text-secondary"
                          >
                            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 bg-amber-dim" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <span className="label mb-1 block text-text-tertiary">
                        Hæfni
                      </span>
                      <p className="mb-3 text-xs font-light leading-relaxed text-text-tertiary">
                        ESCO flokkar hæfni sem dæmigerða eða viðbótar fyrir starfsheiti í evrópsku starfamódeli. Einstakir starfsmenn hafa yfirleitt hluta af listanum — sniðinn að sérhæfingu og vinnuveitanda.
                      </p>

                      {/* Tabs */}
                      <div className="mb-4 flex gap-px border border-border-subtle bg-border-subtle">
                        <button
                          onClick={() => setSkillTab("essential")}
                          className={`flex-1 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-wider transition-colors ${
                            skillTab === "essential"
                              ? "bg-surface-overlay text-amber"
                              : "bg-surface-raised text-text-tertiary hover:text-text-secondary"
                          }`}
                        >
                          Dæmigerð ({essentialSkills.length})
                        </button>
                        <button
                          onClick={() => setSkillTab("optional")}
                          className={`flex-1 px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-wider transition-colors ${
                            skillTab === "optional"
                              ? "bg-surface-overlay text-amber"
                              : "bg-surface-raised text-text-tertiary hover:text-text-secondary"
                          }`}
                        >
                          Viðbótarhæfni ({optionalSkills.length})
                        </button>
                      </div>

                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-2">
                        {(skillTab === "essential"
                          ? essentialSkills
                          : optionalSkills
                        ).map((skill) => (
                          <span
                            key={skill.preferredLabel_is}
                            className={`inline-block border px-3 py-1.5 text-xs font-light ${
                              skillTab === "essential"
                                ? "border-amber/30 bg-amber/5 text-amber-bright"
                                : "border-border-default bg-surface-overlay text-text-secondary"
                            }`}
                            title={skill.description_is}
                          >
                            {skill.preferredLabel_is}
                          </span>
                        ))}
                        {(skillTab === "essential"
                          ? essentialSkills
                          : optionalSkills
                        ).length === 0 && (
                          <p className="text-sm text-text-tertiary">
                            Engin hæfni skráð í þessum flokki
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related occupations */}
                  {related.length > 0 && (
                    <div>
                      <span className="label mb-2 block text-text-tertiary">
                        Skyldir flokkar
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {related.map((r) => (
                          <button
                            key={r.code}
                            onClick={() => handleSelect(r.code)}
                            className="inline-flex items-center gap-2 border border-border-subtle px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-amber/30 hover:text-text-primary"
                          >
                            <span className="font-mono text-[0.625rem] text-amber-dim">
                              {r.code}
                            </span>
                            {r.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ESCO mappings */}
                  {escoOccupations.length > 0 && (
                    <div>
                      <span className="label mb-2 block text-text-tertiary">
                        ESCO tengingar
                      </span>
                      <div className="space-y-2">
                        {escoOccupations.map((esco) => (
                          <div
                            key={esco.conceptUri}
                            className="border border-border-faint bg-surface-base px-4 py-3"
                          >
                            <p className="text-sm font-medium text-text-primary">
                              {esco.preferredLabel_is}
                            </p>
                            <span className="font-mono text-[0.625rem] text-text-tertiary">
                              ISCO {esco.iscoGroup}
                            </span>
                            {esco.description_is && (
                              <p className="mt-1 text-xs font-light leading-relaxed text-text-tertiary">
                                {esco.description_is}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
              })()}
            </div>
          </div>
        )}

        {/* Empty state */}
        {query && !searching && results.length === 0 && !searchError && (
          <div className="border border-border-subtle bg-surface-raised px-8 py-12 text-center">
            <p className="text-sm text-text-tertiary">
              Engar niðurstöður fundust fyrir &ldquo;{query}&rdquo;
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
