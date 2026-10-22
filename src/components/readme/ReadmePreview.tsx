
import { useRef, useState } from "react";
import type {
  ReadmeData,
  ReadmeView,
} from "@/types/readme.types";
import { renderMarkdown } from "@/utils/markdown";
import { createPdf } from "@/utils/createPdf";
import EmptyState from "./EmptyState";

interface ReadmePreviewProps {
  readme: ReadmeData | null;
}

export default function ReadmePreview({
  readme,
}: ReadmePreviewProps) {
  const [view, setView] = useState<ReadmeView>("preview");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const previewRef = useRef<HTMLElement>(null);

  async function copyMarkdown() {
    if (!readme) return;

    try {
      await navigator.clipboard.writeText(readme.markdown);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function handleExportPdf() {
    if (!readme || !previewRef.current) return;

    setExporting(true);
    setPdfError("");

    try {
      const filename = `${readme.repository.replace(
        /[^a-z0-9_-]/gi,
        "-"
      )}-README.pdf`;

      await createPdf(previewRef.current, filename);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setPdfError("Unable to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="workspace">
      <div className="workspace-header">
        <div>
          <h2>README Preview</h2>
          <p>
            {readme
              ? readme.repository
              : "Your rendered documentation will appear here."}
          </p>
        </div>

        {readme && (
          <div className="preview-actions">
            <button
              className="copy-button"
              type="button"
              onClick={() => void copyMarkdown()}
            >
              {copied ? "Copied!" : "Copy Markdown"}
            </button>

            <button
              className="copy-button"
              type="button"
              onClick={() => void handleExportPdf()}
              disabled={exporting}
            >
              {exporting ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        )}
      </div>

      {pdfError && (
        <p className="error-message" role="alert">
          {pdfError}
        </p>
      )}

      {!readme ? (
        <EmptyState />
      ) : (
        <div className="document">
          <div className="document-toolbar">
            <div className="document-file">
              <span className="file-icon">M</span>
              <span>README.md</span>
            </div>

            <div className="view-switch">
              <button
                type="button"
                className={view === "preview" ? "active" : ""}
                onClick={() => setView("preview")}
              >
                Preview
              </button>

              <button
                type="button"
                className={view === "markdown" ? "active" : ""}
                onClick={() => setView("markdown")}
              >
                Markdown
              </button>
            </div>
          </div>

          {view === "preview" ? (
            <article
              ref={previewRef}
              className="markdown-body"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(
  readme.markdown,
  readme.repository,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  readme.defaultBranch
),
              }}
            />
          ) : (
            <pre className="markdown-source">
              <code>{readme.markdown}</code>
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
