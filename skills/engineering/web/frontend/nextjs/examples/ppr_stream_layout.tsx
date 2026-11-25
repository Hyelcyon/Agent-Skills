import { Suspense } from 'react';
import { cookies } from 'next/headers';

export const experimental_ppr = true;

interface VerifiedProfile {
  displayName: string;
}

async function resolveAuthenticatedProfile(sessionToken: string): Promise<VerifiedProfile | null> {
  // Replace with cryptographic session verification and user store lookup
  if (sessionToken.length < 16) {
    return null;
  }
  return { displayName: 'Authenticated Member' };
}

async function DynamicUserProfile() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  const profile = sessionToken ? await resolveAuthenticatedProfile(sessionToken) : null;

  if (!profile) {
    return <div className="guest-banner">Welcome, Guest Visitor</div>;
  }

  // Never render raw cookie/session tokens into DOM output
  return (
    <div className="user-profile-badge">
      <span>Signed in as: {profile.displayName}</span>
    </div>
  );
}

export default function PprStreamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="static-shell-header">
        <div className="logo">Enterprise Portal</div>
        <Suspense fallback={<div className="skeleton-profile">Loading profile...</div>}>
          <DynamicUserProfile />
        </Suspense>
      </header>

      <main className="shell-content">
        {children}
      </main>
    </div>
  );
}
