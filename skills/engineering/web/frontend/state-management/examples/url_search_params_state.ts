const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'title'] as const;
type SortField = (typeof VALID_SORT_FIELDS)[number];

interface SearchState {
  query: string;
  page: number;
  sortBy: SortField;
}

const DEFAULT_SORT: SortField = 'createdAt';

/**
 * Validates, parses, and canonically serializes search/filter state into URLSearchParams.
 */
export class UrlStateManager {
  /**
   * Extracts validated search state from URLSearchParams with safe defaults for malformed inputs.
   */
  parse(searchParams: URLSearchParams): SearchState {
    const query = (searchParams.get('q') ?? '').trim();
    const rawPage = Number(searchParams.get('page') ?? '1');
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const rawSort = searchParams.get('sort') ?? DEFAULT_SORT;
    const sortBy = (VALID_SORT_FIELDS as readonly string[]).includes(rawSort)
      ? (rawSort as SortField)
      : DEFAULT_SORT;

    return { query, page, sortBy };
  }

  /**
   * Serializes search state while omitting canonical defaults to prevent duplicate URLs/cache keys.
   */
  serialize(state: Partial<SearchState>, baseParams?: URLSearchParams): URLSearchParams {
    const params = new URLSearchParams(baseParams);
    params.delete('q');
    params.delete('page');
    params.delete('sort');

    const trimmedQuery = state.query?.trim();
    if (trimmedQuery && trimmedQuery.length > 0) {
      params.set('q', trimmedQuery);
    }

    if (state.page !== undefined && Number.isInteger(state.page) && state.page > 1) {
      params.set('page', String(state.page));
    }

    if (
      state.sortBy !== undefined &&
      state.sortBy !== DEFAULT_SORT &&
      (VALID_SORT_FIELDS as readonly string[]).includes(state.sortBy)
    ) {
      params.set('sort', state.sortBy);
    }

    return params;
  }
}

export { VALID_SORT_FIELDS, DEFAULT_SORT };
export type { SearchState, SortField };
