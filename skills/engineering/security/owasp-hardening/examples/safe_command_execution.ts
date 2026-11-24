import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface GitLogOptions {
  maxCount: number;
  branchName: string;
}

const SAFE_BRANCH_PATTERN = /^[a-zA-Z0-9._\-\/]+$/;

async function getGitCommitLogs(options: GitLogOptions): Promise<string> {
  const boundedCount = Math.max(1, Math.min(options.maxCount, 100));

  if (!SAFE_BRANCH_PATTERN.test(options.branchName)) {
    throw new Error('Invalid branch name provided');
  }

  const args = [
    'log',
    `--max-count=${boundedCount}`,
    '--oneline',
    '--',
    options.branchName
  ];

  const { stdout } = await execFileAsync('git', args, {
    shell: false,
    timeout: 5000,
    maxBuffer: 1024 * 1024
  });

  return stdout;
}

export { getGitCommitLogs };
export type { GitLogOptions };
