
import html2pdf from "html2pdf.js";

export async function createPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  await html2pdf()
    .set({
      margin: [12, 12, 18, 12],
      filename,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      pagebreak: {
        mode: ["css", "legacy"],
        avoid: ["pre", "blockquote", "tr", "img"],
      },
    })
    .from(element)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(12, pageHeight - 13, pageWidth - 12, pageHeight - 13);

        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);

        pdf.text(
          "cwad-repo-to-pdf",
          12,
          pageHeight - 7
        );

        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - 12,
          pageHeight - 7,
          { align: "right" }
        );
      }
      pdf.save(filename);
    })
}
