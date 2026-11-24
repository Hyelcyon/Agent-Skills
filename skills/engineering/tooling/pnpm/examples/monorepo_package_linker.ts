interface PackageManifest {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function validateWorkspaceProtocolLinks(
  manifest: PackageManifest,
  knownWorkspacePackages: Set<string>
): { valid: boolean; missingPackages: string[] } {
  const missingPackages: string[] = [];
  const allDeps = { ...manifest.dependencies, ...manifest.devDependencies };

  for (const [depName, versionSpec] of Object.entries(allDeps)) {
    if (versionSpec.startsWith('workspace:')) {
      if (!knownWorkspacePackages.has(depName)) {
        missingPackages.push(depName);
      }
    }
  }

  return {
    valid: missingPackages.length === 0,
    missingPackages
  };
}
