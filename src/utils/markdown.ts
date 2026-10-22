
import { marked } from "marked";
import DOMPurify from "dompurify";

export function renderMarkdown(
  markdown: string,
  repository: string,
  defaultBranch = "main"
): string {
  const [owner, repo] = repository.split("/");

  const renderer = new marked.Renderer();

  renderer.image = ({ href, title, text }) => {
    let src = href ?? "";

    if (
      src &&
      !/^(?:https?:|data:|blob:|\/\/)/i.test(src)
    ) {
      const path = src
        .replace(/^\.\/+/, "")
        .replace(/^\/+/, "");

      src = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${path}`;
    }

    const safeSrc = escapeHtml(src);
    const safeAlt = escapeHtml(text ?? "");
    const safeTitle = title
      ? ` title="${escapeHtml(title)}"`
      : "";

    return `<img src="${safeSrc}" alt="${safeAlt}"${safeTitle}>`;
  };

  const html = marked.parse(markdown, {
    async: false,
    gfm: true,
    renderer,
  });

  return DOMPurify.sanitize(
    typeof html === "string" ? html : ""
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}
