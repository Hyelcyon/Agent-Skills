export function redactSensitiveLog(logMessage: string): string {
  const tokenPattern = /(Bearer\s+[A-Za-z0-9\-._~+/]+=*)|(api[_-]?key[:=]\s*['"]?[A-Za-z0-9\-_]{16,}['"]?)|(password[:=]\s*['"]?[^'"\s]+['"]?)/gi;
  return logMessage.replace(tokenPattern, (match) => {
    if (match.toLowerCase().startsWith('bearer')) {
      return 'Bearer [REDACTED]';
    }
    return '[REDACTED]';
  });
}
