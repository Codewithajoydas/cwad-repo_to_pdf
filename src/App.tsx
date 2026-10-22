
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RepoForm from "@/components/readme/RepoForm";
import ReadmePreview from "@/components/readme/ReadmePreview";
import { useReadme } from "@/hooks/useReadme";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "@/styles/global.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "@/styles/readme.css";

export default function App() {
  const {
    readme,
    loading,
    error,
    loadReadme,
    setError,
  } = useReadme();

  function handleSubmit(owner: string, repo: string) {
    if (!owner || !repo) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    void loadReadme(owner, repo);
  }

  return (
    <main className="app-shell">
      <Header />

      <section className="hero">
        <p className="eyebrow">GITHUB README EXPORTER</p>

        <h1>cwad-repo-to-pdf</h1>

        <p className="hero-description">
          Fetch a repository README, preview the documentation,
          and export it as a PDF.
        </p>

        <RepoForm
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onClearError={() => setError("")}
        />
      </section>

      <ReadmePreview readme={readme} />

      <Footer />
    </main>
  );
}
