interface PackageJsonManifest {
  name: string;
  version: string;
  type?: string;
  files?: string[];
  exports?: Record<string, unknown>;
  publishConfig?: {
    access?: string;
    provenance?: boolean;
  };
}

interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validatePackageManifest(manifest: PackageJsonManifest): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push('Manifest missing required "name" field');
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push('Manifest missing required "version" field');
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    warnings.push('Manifest lacks "files" whitelist array; risk of leaking uncompiled source or secrets');
  }

  if (!manifest.exports) {
    warnings.push('Manifest lacks modern "exports" field; subpath imports and dual ESM/CJS exports will be unconstrained');
  }

  if (manifest.publishConfig?.provenance !== true) {
    warnings.push('Publish provenance is not enabled in "publishConfig"');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export { validatePackageManifest };
export type { PackageJsonManifest, ValidationReport };
