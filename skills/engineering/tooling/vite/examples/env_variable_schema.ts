interface ViteEnvironment {
  VITE_API_BASE_URL: string;
  VITE_APP_STAGE: 'development' | 'staging' | 'production';
  VITE_ENABLE_ANALYTICS: boolean;
}

export function validateViteEnv(env: Record<string, string | undefined>): ViteEnvironment {
  const apiUrl = env['VITE_API_BASE_URL'];
  if (!apiUrl || !apiUrl.startsWith('http')) {
    throw new Error('VITE_API_BASE_URL must be a valid HTTP/HTTPS URL');
  }

  const stage = env['VITE_APP_STAGE'];
  if (stage !== 'development' && stage !== 'staging' && stage !== 'production') {
    throw new Error('VITE_APP_STAGE must be development, staging, or production');
  }

  const enableAnalytics = env['VITE_ENABLE_ANALYTICS'] === 'true';

  return {
    VITE_API_BASE_URL: apiUrl,
    VITE_APP_STAGE: stage,
    VITE_ENABLE_ANALYTICS: enableAnalytics
  };
}
