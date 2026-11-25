import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface DesignFinding {
  ruleId: string;
  severity: 'error' | 'warn';
  message: string;
}

export interface DesignAuditReport {
  score: number;
  passed: boolean;
  findings: DesignFinding[];
}

const PURPLE_SLOP_RE = /(?:#(?:6366f1|7c3aed|8b5cf6|a855f7)\b|from-(?:indigo|violet|purple)-\d+|to-(?:purple|fuchsia|violet)-\d+)/i;
const LINEAR_TRANSITION_RE = /transition(?:-timing-function)?\s*:[^;]*\blinear\b(?!\s*\()/i;
const SLOW_UI_TRANSITION_RE = /transition(?:-duration)?\s*:[^;]*\b(?:3[5-9]\d|[4-9]\d{2,})ms\b/i;
const HEAVY_BLUR_SHADOW_RE = /box-shadow\s*:[^;]*\b(?:2\d|3\d|[4-9]\d+)px\s+rgba\(/i;
const CLICHE_COPY_RE = /\b(unleash|supercharge|revolutionize|seamless|next-generation|elevate your workflow)\b/i;

export function auditDesignTasteSource(source: string): DesignAuditReport {
  const findings: DesignFinding[] = [];

  if (PURPLE_SLOP_RE.test(source)) {
    findings.push({
      ruleId: 'lila-gradient-ban',
      severity: 'error',
      message: 'Detected default indigo/violet gradient palette; replace with tinted OKLCH neutrals and a single intentional accent.',
    });
  }

  if (LINEAR_TRANSITION_RE.test(source)) {
    findings.push({
      ruleId: 'no-linear-ui-easing',
      severity: 'error',
      message: 'Detected linear transition timing on UI styles; use weighted cubic-bezier easing curves.',
    });
  }

  if (SLOW_UI_TRANSITION_RE.test(source)) {
    findings.push({
      ruleId: 'snappy-micro-timing',
      severity: 'warn',
      message: 'Detected slow (>=350ms) transition duration; keep micro-interactions at 140ms-240ms.',
    });
  }

  if (HEAVY_BLUR_SHADOW_RE.test(source)) {
    findings.push({
      ruleId: 'surface-over-shadow',
      severity: 'warn',
      message: 'Detected heavy blurred rgba box-shadow; prefer OKLCH lightness steps paired with 1px hairlines.',
    });
  }

  const clicheMatch = source.match(CLICHE_COPY_RE);
  if (clicheMatch) {
    findings.push({
      ruleId: 'cliche-marketing-copy',
      severity: 'warn',
      message: `Detected cliché marketing copy token '${clicheMatch[0]}'; replace with concrete product language.`,
    });
  }

  const emDashCount = (source.match(/\u2014/g) ?? []).length;
  if (emDashCount >= 3) {
    findings.push({
      ruleId: 'em-dash-overuse',
      severity: 'warn',
      message: `Detected ${emDashCount} em-dash characters; tighten punctuation and sentence structure.`,
    });
  }

  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warnCount = findings.filter((f) => f.severity === 'warn').length;
  const score = Math.max(0, 100 - errorCount * 25 - warnCount * 10);

  return {
    score,
    passed: errorCount === 0,
    findings,
  };
}

const isCliEntry = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCliEntry) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node design_taste_audit.ts <file-path>');
    process.exit(2);
  }
  const content = fs.readFileSync(target, 'utf8');
  const report = auditDesignTasteSource(content);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.passed ? 0 : 1);
}
