export interface FrontmatterValidationResult {
  valid: boolean;
  name?: string;
  description?: string;
  error?: string;
}

export function validateSkillFrontmatter(content: string): FrontmatterValidationResult {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    return { valid: false, error: 'Missing YAML frontmatter block' };
  }

  const lines = frontmatterMatch[1].split(/\r?\n/);
  let name: string | undefined;
  let description: string | undefined;

  for (const line of lines) {
    if (line.startsWith('name:')) {
      name = line.slice('name:'.length).trim();
    } else if (line.startsWith('description:')) {
      description = line.slice('description:'.length).trim();
    }
  }

  if (!name || !/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: 'Invalid or missing lowercase kebab-case name' };
  }

  if (!description || description.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }

  return { valid: true, name, description };
}
