import { cookies, headers } from 'next/headers';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TenantDashboardPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params;
  const { tab = 'metrics' } = await searchParams;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('tenant_session');

  const headersList = await headers();
  const host = headersList.get('host') || 'unknown';

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>Tenant: {tenantId}</h1>
        <p>Host: {host}</p>
        <p>Authenticated: {sessionToken ? 'Yes' : 'No'}</p>
      </header>

      <nav className="dashboard-nav">
        <Link href={`/tenants/${tenantId}?tab=metrics`}>Metrics</Link>
        <Link href={`/tenants/${tenantId}?tab=settings`}>Settings</Link>
      </nav>

      <section className="dashboard-content">
        <h2>Active Tab: {tab}</h2>
      </section>
    </main>
  );
}
