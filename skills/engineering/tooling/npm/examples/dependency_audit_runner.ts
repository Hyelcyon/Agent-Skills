interface AuditVulnerability {
  name: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  via: string[];
}

interface AuditReport {
  vulnerabilities: Record<string, AuditVulnerability>;
}

export function parseAuditResults(jsonText: string): { highOrCriticalCount: number; clean: boolean } {
  const report: AuditReport = JSON.parse(jsonText);
  let highOrCriticalCount = 0;

  for (const vuln of Object.values(report.vulnerabilities || {})) {
    if (vuln.severity === 'high' || vuln.severity === 'critical') {
      highOrCriticalCount += 1;
    }
  }

  return {
    highOrCriticalCount,
    clean: highOrCriticalCount === 0
  };
}
