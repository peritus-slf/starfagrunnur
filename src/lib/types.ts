export type SearchResultType = "istarf" | "esco";
export type SearchMatchSource = "code" | "istarf21" | "esco" | "alias";

export interface SearchResult {
  /** "istarf" = ÍSTARF21 category/group; "esco" = ESCO occupation (role title) */
  result_type: SearchResultType;
  /** ÍSTARF21 code to navigate to on click. For ESCO results this is the parent group code. */
  code: string;
  /** What to display as the hit label (category title or ESCO occupation label). */
  title: string;
  /** ÍSTARF21 level (1-4). For ESCO results, the parent group's level. */
  level: number;
  match_source: SearchMatchSource;
  /** Only set on ESCO results — parent ÍSTARF group code + title for context. */
  group_code?: string;
  group_title?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface OccupationDetail {
  code: string;
  title: string;
  level: number;
  source_system: string;
  parent: OccupationGroupSummary | null;
  description: string | null;
  tasks: string[] | null;
  example_titles: string[] | null;
  notes: string | null;
}

export interface OccupationGroupSummary {
  code: string;
  title: string;
  level: number;
}

export interface SkillItem {
  preferredLabel_is: string;
  skillType: string;
  description_is: string;
  relationType: string;
  occupation: string;
}

export interface SkillsResponse {
  items: SkillItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EscoOccupation {
  conceptUri: string;
  preferredLabel_is: string;
  description_is: string | null;
  iscoGroup: string;
}
