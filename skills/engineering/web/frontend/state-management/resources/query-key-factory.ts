/**
 * Creates a hierarchical TanStack Query v5 key factory scoped to a single domain prefix.
 *
 * @param domain - Top-level resource segment (e.g. "users", "orders").
 * @returns Key builders compatible with prefix invalidation in cancelQueries and invalidateQueries.
 */
export const createQueryKeyFactory = <TDomain extends string>(domain: TDomain) => {
  return {
    all: [domain] as const,
    lists: () => [domain, 'list'] as const,
    list: <TFilters extends object>(filters: TFilters) => [domain, 'list', filters] as const,
    details: () => [domain, 'detail'] as const,
    detail: (id: string | number) => [domain, 'detail', id] as const
  };
};
