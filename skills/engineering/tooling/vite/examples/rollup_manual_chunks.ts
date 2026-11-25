export function vendorChunkSplitter(id: string): string | undefined {
  const normalizedId = id.replaceAll('\\', '/');
  if (normalizedId.includes('/node_modules/')) {
    if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(normalizedId)) {
      return 'vendor-react';
    }
    if (/\/node_modules\/(?:@tanstack|zustand)\//.test(normalizedId)) {
      return 'vendor-state';
    }
    return 'vendor-core';
  }
  return undefined;
}
