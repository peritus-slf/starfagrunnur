import type {
  SearchResponse,
  OccupationDetail,
  SkillsResponse,
  OccupationGroupSummary,
  EscoOccupation,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message || `API villa: ${status}`);
    this.status = status;
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, `API villa: ${res.status}`);
  }
  return res.json();
}

export async function searchOccupations(
  query: string
): Promise<SearchResponse> {
  return apiFetch(`/search?q=${encodeURIComponent(query)}`);
}

export async function getOccupation(code: string): Promise<OccupationDetail> {
  return apiFetch(`/occupations/${encodeURIComponent(code)}`);
}

export async function getSkills(
  code: string,
  page?: number,
  pageSize?: number
): Promise<SkillsResponse> {
  const params = new URLSearchParams();
  if (page !== undefined) params.set("page", String(page));
  if (pageSize !== undefined) params.set("page_size", String(pageSize));
  const qs = params.toString();
  return apiFetch(
    `/occupations/${encodeURIComponent(code)}/skills${qs ? `?${qs}` : ""}`
  );
}

export async function getAncestors(
  code: string
): Promise<OccupationGroupSummary[]> {
  return apiFetch(`/occupations/${encodeURIComponent(code)}/ancestors`);
}

export async function getRelated(
  code: string
): Promise<OccupationGroupSummary[]> {
  return apiFetch(`/occupations/${encodeURIComponent(code)}/related`);
}

export async function getEscoOccupations(
  code: string
): Promise<EscoOccupation[]> {
  return apiFetch(`/occupations/${encodeURIComponent(code)}/esco`);
}
