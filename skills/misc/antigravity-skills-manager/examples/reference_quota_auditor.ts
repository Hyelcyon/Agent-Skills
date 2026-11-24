const MAJOR_FRAMEWORKS = new Set(['react', 'vue', 'angular', 'svelte', 'nodejs', 'nextjs']);

export function evaluateSkillQuotas(
  skillName: string,
  referenceCount: number,
  exampleCount: number,
  resourceCount: number
): { compliant: boolean; missingItems: string[] } {
  const missingItems: string[] = [];
  const requiredRefs = MAJOR_FRAMEWORKS.has(skillName) ? 7 : 3;

  if (referenceCount < requiredRefs) {
    missingItems.push(`References: ${referenceCount}/${requiredRefs}`);
  }

  if (exampleCount < 3) {
    missingItems.push(`Examples: ${exampleCount}/3`);
  }

  if (resourceCount < 3) {
    missingItems.push(`Resources: ${resourceCount}/3`);
  }

  return {
    compliant: missingItems.length === 0,
    missingItems
  };
}
