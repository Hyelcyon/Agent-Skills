interface SearchState {
  query: string;
  page: number;
  sortBy: string;
}

export class UrlStateManager {
  parse(searchParams: URLSearchParams): SearchState {
    const query = searchParams.get('q') || '';
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const sortBy = searchParams.get('sort') || 'createdAt';

    return { query, page, sortBy };
  }

  serialize(state: Partial<SearchState>): URLSearchParams {
    const params = new URLSearchParams();

    if (state.query && state.query.trim().length > 0) {
      params.set('q', state.query.trim());
    }

    if (state.page && state.page > 1) {
      params.set('page', String(state.page));
    }

    if (state.sortBy && state.sortBy !== 'createdAt') {
      params.set('sort', state.sortBy);
    }

    return params;
  }
}
