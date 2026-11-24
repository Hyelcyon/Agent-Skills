export function verifyTarballFileList(
  packedFiles: string[],
  forbiddenPatterns: string[] = ['.env', 'credentials', '.git', 'src/']
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const file of packedFiles) {
    for (const pattern of forbiddenPatterns) {
      if (file.includes(pattern)) {
        violations.push(file);
        break;
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}
