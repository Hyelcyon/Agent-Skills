import { Suspense } from 'react';
import { cookies } from 'next/headers';

export const experimental_ppr = true;

async function DynamicUserProfile() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_id');

  if (!userCookie) {
    return <div className="guest-banner">Welcome, Guest Visitor</div>;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  return (
    <div className="user-profile-badge">
      <span>Active Session ID: {userCookie.value}</span>
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
