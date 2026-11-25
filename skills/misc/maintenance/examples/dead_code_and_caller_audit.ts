import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ExportAuditReport {
  totalFilesScanned: number;
  potentiallyUnusedExports: Array<{ file: string; symbol: string }>;
}

const EXPORT_DECL_RE = /export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/g;

export function findPotentiallyUnusedExports(
  files: Array<{ file: string; content: string }>
): ExportAuditReport {
  const declarations: Array<{ file: string; symbol: string }> = [];

  for (const entry of files) {
    if (entry.file.endsWith('index.ts') || entry.file.endsWith('.d.ts')) continue;
    for (const match of entry.content.matchAll(EXPORT_DECL_RE)) {
      const symbol = match[1];
      if (symbol) declarations.push({ file: entry.file, symbol });
    }
  }

  const potentiallyUnusedExports = declarations.filter(({ file, symbol }) => {
    const tokenRe = new RegExp(`\\b${symbol}\\b`);
    return !files.some((other) => other.file !== file && tokenRe.test(other.content));
  });

  return {
    totalFilesScanned: files.length,
    potentiallyUnusedExports,
  };
}

function collectTsFiles(rootDir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const full = path.join(rootDir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git') continue;
      collectTsFiles(full, out);
    } else if (ent.isFile() && (ent.name.endsWith('.ts') || ent.name.endsWith('.tsx'))) {
      out.push(full);
    }
  }
  return out;
}

const isCli = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const targetDir = process.argv[2] ?? '.';
  const loaded = collectTsFiles(targetDir).map((file) => ({
    file,
    content: fs.readFileSync(file, 'utf8'),
  }));
  console.log(JSON.stringify(findPotentiallyUnusedExports(loaded), null, 2));
}
