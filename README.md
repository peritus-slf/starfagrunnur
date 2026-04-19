# Starfagrunnur

**An open Icelandic occupational knowledge graph, served as a read-only REST API and a browsable landing page.**

[![CI](https://github.com/peritus/starfagrunnur/actions/workflows/ci.yml/badge.svg)](https://github.com/peritus/starfagrunnur/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Live site: **[starfagrunnur.is](https://starfagrunnur.is)** · API: **[api.starfagrunnur.is](https://api.starfagrunnur.is)** · Docs: **[/docs](https://starfagrunnur.is/docs)**

---

## What this is

Iceland's national occupation classification (**ÍSTARF21**, a local adaptation of ISCO-08) and the European Skills, Competences, Qualifications and Occupations framework (**ESCO**) have no public, joined-up representation in Icelandic. If you want to know *"what skills does a `hjúkrunarfræðingur` need?"* or *"which ESCO roles map to ÍSTARF unit 2221?"*, you have to stitch that yourself from PDFs and CSV dumps.

Starfagrunnur bridges the two classifications in a Neo4j graph and exposes the whole thing as a free REST API:

```
578    ÍSTARF21 occupation groups      (9 bálkar · 39 deildir · 121 klasar · 409 starfaflokkar)
3,039  ESCO occupations in Icelandic   (2,983 bridged to ÍSTARF21 · 56 orphan)
13,939 ESCO skills                     (10,715 competencies · 3,219 knowledge)
126,051 REQUIRES_SKILL relationships    (67,600 essential · 58,451 optional)
```

No API key. No auth. CC BY 4.0 for ESCO content.

## Quickstart

```bash
# Find an occupation
curl https://api.starfagrunnur.is/api/v1/search?q=hjúkrunarfræðingur

# Look it up in detail (ÍSTARF21 code 2221)
curl https://api.starfagrunnur.is/api/v1/occupations/2221

# Get every ESCO role in that category
curl https://api.starfagrunnur.is/api/v1/occupations/2221/esco

# Reverse-lookup: which jobs require a specific skill?
curl "https://api.starfagrunnur.is/api/v1/skills/ccd0a1d9-afda-43d9-b901-96344886e14d/occupations"
```

Full interactive docs with "Try it out" at **[/docs](https://starfagrunnur.is/docs)**. The OpenAPI 3.1 spec is at **[/openapi.yaml](https://starfagrunnur.is/openapi.yaml)** — each operation includes "Answers questions like…" annotations to help agents pick the right endpoint.

Machine-readable primer for LLM tool-use: **[/llms.txt](https://starfagrunnur.is/llms.txt)**.

## How the bridge works

ÍSTARF21 and ESCO share **ISCO-08 as a common ancestor**. ESCO occupations carry an `iscoGroup` property; ÍSTARF21 level-4 codes are ISCO-08 unit-aligned. Joining on that code bridges the two:

```
(OccupationGroup)<-[:BELONGS_TO_GROUP]-(EscoOccupation)-[:REQUIRES_SKILL]->(Skill)
     └─ ÍSTARF21                         └─ ESCO role              └─ ESCO skill
```

ÍSTARF21 contributes the *categorisation* (a 4-level hierarchy describing the Icelandic labour-market structure). ESCO contributes *role titles + skills + descriptions* (because ÍSTARF21 itself only describes tasks at the unit level and has no skill taxonomy). Together they give you "what are the Icelandic occupations, and what does each require?" in one graph.

## Tech stack

- **Runtime:** Next.js 16 (App Router), React 19, TypeScript
- **Graph:** Neo4j 5 (Bolt via `neo4j-driver`)
- **UI:** Tailwind CSS v4
- **API:** REST endpoints under `/api/v1/*`, OpenAPI 3.1 spec served at `/openapi.yaml`
- **Docs:** Swagger UI (self-hosted from `public/swagger/`)
- **Deploy:** Vercel, with `api.starfagrunnur.is` hosted on the same deploy via host-based routing

Neo4j is an external dependency — this repo only contains the web application. The data-ingestion pipeline (ÍSTARF21 PDF parsing + ESCO CSV ingestion + graph loading) lives in a separate Python project.

## Local development

You need a running Neo4j with the Starfagrunnur data loaded. If you have the ingestion pipeline set up:

```bash
git clone https://github.com/peritus/starfagrunnur.git
cd starfagrunnur
cp .env.example .env.local
# Edit .env.local with your Neo4j connection details

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API is available at `http://localhost:3000/api/v1/*`.

### Running without your own Neo4j

Point `NEO4J_URI` at a read-only connection to the production graph if you have one, or stand up your own via the Python ingestion pipeline (not included here).

## Scripts

```bash
npm run dev        # Start the Next.js dev server (Turbopack)
npm run build      # Production build
npm run start      # Run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run test       # Vitest
```

## API surface

16 endpoints across four groups. See `/docs` for interactive documentation.

- **Search** — cross-source fuzzy search resolving ÍSTARF categories + ESCO roles + aliases
- **Occupations** — browse the ÍSTARF21 hierarchy (list, detail, ancestors, children, descendants, related)
- **ESCO** — list/detail ESCO occupations, get their skills, see their ÍSTARF ancestor chain
- **Skills** — list/detail skills, *reverse lookup* which occupations require a given skill

## Security

The API is public, read-only, and anonymous. All Cypher queries are parameterized; UUIDs and codes are validated with strict regexes; pagination and query-length are capped to prevent DoS. CSP + HSTS + baseline security headers are applied via `next.config.ts`.

Report security issues via email — see `SECURITY.md`.

## Data sources

- **ÍSTARF21** — Hagstofa Íslands (Statistics Iceland). https://hagstofa.is
- **ESCO v1** — European Commission. Licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). https://esco.ec.europa.eu

## License

[MIT](./LICENSE). ESCO content retains its CC BY 4.0 attribution.

## Maintainer

Built and maintained by [Peritus](https://peritus.is).
