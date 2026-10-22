import { useState } from "react";
import { fetchReadme } from "@/services/github.service";
import type { ReadmeData } from "@/types/readme.types";

export function useReadme() {
  const [readme, setReadme] = useState<ReadmeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReadme(owner: string, repo: string) {
    setLoading(true);
    setError("");
    setReadme(null);

    try {
      const data = await fetchReadme(owner, repo);
      setReadme(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    readme,
    loading,
    error,
    loadReadme,
    setError,
  };
}