import { Suspense } from 'react';
import { cookies } from 'next/headers';

export const experimental_ppr = true;

async function DynamicUserProfile() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_id');

  if (!userCookie) {
    return <div class="guest-banner">Welcome, Guest Visitor</div>;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  return (
    <div class="user-profile-badge">
      <span>Active Session ID: {userCookie.value}</span>
    </div>
  );
}

export default function PprStreamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div class="app-shell">
      <header class="static-shell-header">
        <div class="logo">Enterprise Portal</div>
        <Suspense fallback={<div class="skeleton-profile">Loading profile...</div>}>
          <DynamicUserProfile />
        </Suspense>
      </header>

      <main class="shell-content">
        {children}
      </main>
    </div>
  );
}
