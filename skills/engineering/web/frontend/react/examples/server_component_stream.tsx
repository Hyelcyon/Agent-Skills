import { Suspense } from 'react';

interface MetricItem {
  id: string;
  name: string;
  value: number;
}

async function AsyncMetricCards() {
  const data: MetricItem[] = await new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'm1', name: 'Server Throughput', value: 1420 },
        { id: 'm2', name: 'Active Sessions', value: 380 }
      ]);
    }, 120);
  });

  return (
    <div className="metric-grid">
      {data.map((item) => (
        <article key={item.id} className="metric-card">
          <h4>{item.name}</h4>
          <p className="metric-value">{item.value.toLocaleString()}</p>
        </article>
      ))}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <section className="analytics-page">
      <header>
        <h2>System Telemetry</h2>
      </header>

      <Suspense fallback={<div className="skeleton-loader">Loading telemetry...</div>}>
        <AsyncMetricCards />
      </Suspense>
    </section>
  );
}
