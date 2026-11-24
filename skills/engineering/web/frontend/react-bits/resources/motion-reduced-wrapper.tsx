import React, { useEffect, useState } from 'react';

interface MotionReducedWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function MotionReducedWrapper({
  children,
  fallback,
  className = ''
}: MotionReducedWrapperProps) {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReduced) {
    return fallback ? (
      <div className={className}>{fallback}</div>
    ) : (
      <div className={`transition-none animate-none ${className}`}>{children}</div>
    );
  }

  return <div className={className}>{children}</div>;
}
