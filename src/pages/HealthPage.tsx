import { StatusBadge } from "@/components/ui/StatusBadge";

export function HealthPage() {
  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Template verification</p>
        <h1>Health Check</h1>
        <p>The React application booted successfully.</p>
        <StatusBadge status="healthy" />
      </section>
    </main>
  );
}