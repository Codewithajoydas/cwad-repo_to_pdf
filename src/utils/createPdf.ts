
export async function createPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  if (!element.textContent?.trim()) {
    throw new Error("No README content available to export.");
  }

  // Open synchronously so the browser does not block the popup.
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error(
      "Print window blocked. Allow popups for this website and try again."
    );
  }

  const doc = printWindow.document;

  doc.title = filename.replace(/\.pdf$/i, "");

  const meta = doc.createElement("meta");
  meta.setAttribute("charset", "UTF-8");
  doc.head.appendChild(meta);

  // Copy existing stylesheets so Markdown styling is preserved.
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    .forEach((link) => {
      const clone = doc.createElement("link");
      clone.rel = "stylesheet";
      clone.href = link.href;
      doc.head.appendChild(clone);
    });

  document
    .querySelectorAll<HTMLStyleElement>("style")
    .forEach((style) => {
      doc.head.appendChild(style.cloneNode(true));
    });

  const printStyles = doc.createElement("style");

  printStyles.textContent = `
    @page {
      size: A4;
      margin: 16mm 14mm 18mm;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: #fff !important;
      color: #24292f !important;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .markdown-body {
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      height: auto !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: #fff !important;
      color: #24292f !important;
      font-size: 10pt !important;
      line-height: 1.55 !important;
      overflow-wrap: anywhere !important;
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4 {
      break-after: avoid-page;
      page-break-after: avoid;
    }

    .markdown-body p,
    .markdown-body li {
      orphans: 3;
      widows: 3;
    }

    .markdown-body pre,
    .markdown-body blockquote,
    .markdown-body img,
    .markdown-body tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .markdown-body pre {
      max-width: 100% !important;
      overflow: visible !important;
      white-space: pre-wrap !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }

    .markdown-body table {
      display: table !important;
      width: 100% !important;
      max-width: 100% !important;
      overflow: visible !important;
      border-collapse: collapse;
    }

    .markdown-body img {
      max-width: 100% !important;
      height: auto !important;
    }

    .markdown-body a {
      color: #0969da;
      text-decoration: none;
    }

    * {
      box-sizing: border-box;
    }
  `;

  doc.head.appendChild(printStyles);

  const content = element.cloneNode(true) as HTMLElement;
  content.removeAttribute("id");
  content.style.cssText = "";

  doc.body.appendChild(content);

  try {
    await new Promise<void>((resolve) => {
      if (doc.readyState === "complete") {
        resolve();
      } else {
        printWindow.addEventListener("load", () => resolve(), {
          once: true,
        });
      }
    });

    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }

    await Promise.all(
      Array.from(doc.images).map(async (img) => {
        if (img.complete) return;

        await new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      })
    );

    printWindow.focus();
    printWindow.print();
  } catch (error) {
    printWindow.close();
    throw error;
  }
}
