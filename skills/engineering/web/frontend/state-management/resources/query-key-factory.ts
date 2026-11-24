export const createQueryKeyFactory = <TDomain extends string>(domain: TDomain) => {
  return {
    all: [domain] as const,
    lists: () => [domain, 'list'] as const,
    list: (filters: Record<string, unknown>) => [domain, 'list', filters] as const,
    details: () => [domain, 'detail'] as const,
    detail: (id: string | number) => [domain, 'detail', id] as const
  };
};
