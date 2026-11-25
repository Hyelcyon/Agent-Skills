import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const ALLOWED_TABS = new Set(['metrics', 'settings']);
const TENANT_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;

interface PageProps {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TenantDashboardPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params;
  if (!TENANT_ID_PATTERN.test(tenantId)) {
    notFound();
  }

  const { tab: rawTab } = await searchParams;
  const tab = rawTab && ALLOWED_TABS.has(rawTab) ? rawTab : 'metrics';

  const cookieStore = await cookies();
  // Production routes must verify session signature and tenant membership server-side
  const hasSessionCookie = Boolean(cookieStore.get('tenant_session')?.value);

  const headersList = await headers();
  const host = headersList.get('host') || 'unknown';
  const encodedTenantId = encodeURIComponent(tenantId);

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>Tenant: {tenantId}</h1>
        <p>Host: {host}</p>
        <p>Session Cookie Present: {hasSessionCookie ? 'Yes' : 'No'}</p>
      </header>

      <nav className="dashboard-nav">
        <Link href={`/tenants/${encodedTenantId}?tab=metrics`}>Metrics</Link>
        <Link href={`/tenants/${encodedTenantId}?tab=settings`}>Settings</Link>
      </nav>

      <section className="dashboard-content">
        <h2>Active Tab: {tab}</h2>
      </section>
    </main>
  );
}
