interface SkillScaffoldPlan {
  name: string;
  isMajorFramework: boolean;
  requiredReferences: number;
  requiredExamples: number;
  requiredResources: number;
}

export function planSkillStructure(name: string, isMajorFramework: boolean): SkillScaffoldPlan {
  return {
    name,
    isMajorFramework,
    requiredReferences: isMajorFramework ? 7 : 3,
    requiredExamples: 3,
    requiredResources: 3
  };
}

export function generateDirectoryList(basePath: string, plan: SkillScaffoldPlan): string[] {
  return [
    `${basePath}/${plan.name}`,
    `${basePath}/${plan.name}/references`,
    `${basePath}/${plan.name}/examples`,
    `${basePath}/${plan.name}/resources`
  ];
}
