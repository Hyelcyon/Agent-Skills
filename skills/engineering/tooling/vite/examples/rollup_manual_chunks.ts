export function vendorChunkSplitter(id: string): string | undefined {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('react-dom')) {
      return 'vendor-react';
    }
    if (id.includes('@tanstack') || id.includes('zustand')) {
      return 'vendor-state';
    }
    return 'vendor-core';
  }
  return undefined;
}
