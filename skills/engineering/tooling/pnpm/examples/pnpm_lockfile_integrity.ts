export function checkFrozenLockfilePrerequisites(
  lockfileExists: boolean,
  isCiEnvironment: boolean
): { command: string; canProceed: boolean; error?: string } {
  if (isCiEnvironment && !lockfileExists) {
    return {
      command: '',
      canProceed: false,
      error: 'Cannot run frozen-lockfile in CI when pnpm-lock.yaml is missing.'
    };
  }

  return {
    command: isCiEnvironment ? 'pnpm install --frozen-lockfile' : 'pnpm install',
    canProceed: true
  };
}
