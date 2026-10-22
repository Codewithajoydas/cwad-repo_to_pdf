import { useState, type FormEvent } from "react";
import ErrorMessage from "@/components/ui/ErrorMessage";

interface RepoFormProps {
  loading: boolean;
  error: string;
  onSubmit: (owner: string, repo: string) => void;
  onClearError: () => void;
}

export default function RepoForm({
  loading,
  error,
  onSubmit,
  onClearError,
}: RepoFormProps) {
  const [repoUrl, setRepoUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const match = repoUrl.trim().match(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#]+)\/?(?:[?#].*)?$/i
    );

    if (!match) {
      onClearError();
      onSubmit("", "");
      return;
    }

    onSubmit(match[1], match[2].replace(/\.git$/i, ""));
  }

  return (
    <>
      <form className="repo-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <span className="input-icon">↗</span>

          <input
            type="text"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/owner/repository"
            aria-label="GitHub repository URL"
            required
          />

          {repoUrl && (
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setRepoUrl("");
                onClearError();
              }}
              aria-label="Clear URL"
            >
              ×
            </button>
          )}
        </div>

        <button
          className="generate-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Generate README →"}
        </button>
      </form>

      <ErrorMessage message={error} />

      <p className="hint">
        Supports public GitHub repositories with a README.md file.
      </p>
    </>
  );
}