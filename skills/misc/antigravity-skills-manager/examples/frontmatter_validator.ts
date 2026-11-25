export interface FrontmatterValidationResult {
  valid: boolean;
  name?: string;
  description?: string;
  errors: string[];
}

const VALID_SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function stripSurroundingQuotes(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function validateSkillFrontmatter(
  content: string,
  expectedDirectoryName?: string
): FrontmatterValidationResult {
  const errors: string[] = [];
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatterMatch) {
    return { valid: false, errors: ['Missing or unclosed YAML frontmatter block'] };
  }

  const lines = frontmatterMatch[1].split(/\r?\n/);
  let name: string | undefined;
  let description: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('name:')) {
      name = stripSurroundingQuotes(line.slice('name:'.length));
    } else if (line.startsWith('description:')) {
      const rest = line.slice('description:'.length).trim();
      if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
        const folded: string[] = [];
        while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
          i++;
          folded.push(lines[i].trim());
        }
        description = folded.join(' ').trim();
      } else {
        description = stripSurroundingQuotes(rest);
      }
    }
  }

  if (!name) {
    errors.push('Missing required field: name');
  } else {
    if (name.length > 64) {
      errors.push(`name exceeds 64 characters (${name.length})`);
    }
    if (!VALID_SKILL_NAME.test(name)) {
      errors.push('name must use lowercase letters, digits, and single hyphens only');
    }
    if (expectedDirectoryName && name !== expectedDirectoryName) {
      errors.push(`name '${name}' does not match directory '${expectedDirectoryName}'`);
    }
  }

  if (!description || description.length < 10) {
    errors.push('description must be at least 10 characters');
  } else if (description.length > 1024) {
    errors.push(`description exceeds 1024 characters (${description.length})`);
  }

  return {
    valid: errors.length === 0,
    name,
    description,
    errors,
  };
}
