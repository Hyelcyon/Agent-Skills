import path from 'node:path';
import { realpath, readFile } from 'node:fs/promises';

interface SafeFileReadResult {
  filePath: string;
  content: Buffer;
}

async function readDocumentSafely(baseDirectory: string, requestedRelativePath: string): Promise<SafeFileReadResult> {
  if (requestedRelativePath.includes('\0')) {
    throw new Error('Null byte injection detected');
  }

  const resolvedBase = path.resolve(baseDirectory);
  const targetPath = path.resolve(resolvedBase, requestedRelativePath);

  const baseWithSeparator = resolvedBase.endsWith(path.sep)
    ? resolvedBase
    : `${resolvedBase}${path.sep}`;

  if (!targetPath.startsWith(baseWithSeparator) && targetPath !== resolvedBase) {
    throw new Error('Access denied: Traversal out of base directory');
  }

  const canonicalTarget = await realpath(targetPath);
  const canonicalBase = await realpath(resolvedBase);

  const canonicalBaseWithSep = canonicalBase.endsWith(path.sep)
    ? canonicalBase
    : `${canonicalBase}${path.sep}`;

  if (!canonicalTarget.startsWith(canonicalBaseWithSep) && canonicalTarget !== canonicalBase) {
    throw new Error('Access denied: Symlink traversal detected');
  }

  const content = await readFile(canonicalTarget);

  return {
    filePath: canonicalTarget,
    content
  };
}

export { readDocumentSafely };
export type { SafeFileReadResult };
