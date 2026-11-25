import path from 'node:path';
import { realpath, readFile } from 'node:fs/promises';

interface SafeFileReadResult {
  filePath: string;
  content: Buffer;
}

function isInsideBaseDir(baseDir: string, candidatePath: string): boolean {
  const normalizedBase = process.platform === 'win32' ? baseDir.toLowerCase() : baseDir;
  const normalizedTarget = process.platform === 'win32' ? candidatePath.toLowerCase() : candidatePath;
  const rel = path.relative(normalizedBase, normalizedTarget);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

async function readDocumentSafely(baseDirectory: string, requestedRelativePath: string): Promise<SafeFileReadResult> {
  if (!requestedRelativePath || requestedRelativePath.includes('\0')) {
    throw new Error('Invalid or null-byte file path');
  }

  const resolvedBase = path.resolve(baseDirectory);
  const targetPath = path.resolve(resolvedBase, requestedRelativePath);

  if (!isInsideBaseDir(resolvedBase, targetPath)) {
    throw new Error('Access denied: Traversal out of base directory');
  }

  const canonicalTarget = await realpath(targetPath);
  const canonicalBase = await realpath(resolvedBase);

  if (!isInsideBaseDir(canonicalBase, canonicalTarget)) {
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
