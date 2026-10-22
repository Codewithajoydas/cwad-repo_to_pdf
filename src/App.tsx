import { Link } from "react-router-dom";

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">CWAD React Template</p>
        <h1>React + TypeScript + Vite</h1>
        <p>
          A professional foundation with routing, data fetching, validation,
          testing, linting, formatting, and a scalable feature structure.
        </p>
        <Link className="button" to="/health">
          Open health check
        </Link>
      </section>
    </main>
  );
}