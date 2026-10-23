# CWAD Repo to PDF

**Convert GitHub repository documentation and local Markdown files into clean, printable PDF documents.**

[Live Demo](https://cwad-repo-to-pdf.codewithajoydas.in/) · [GitHub Repository](https://github.com/Codewithajoydas/cwad-repo_to_pdf) · [Report an Issue](https://github.com/Codewithajoydas/cwad-repo_to_pdf/issues)

---

## Overview

**CWAD Repo to PDF** is a browser-based tool that helps developers convert GitHub README files and local Markdown documents into PDF documents.

Instead of manually copying documentation into a word processor or printing a GitHub page, users can provide a public GitHub repository URL or upload a Markdown file and generate a PDF directly from the application.

The application is designed for developers who want to save project documentation for offline reading, create printable technical documents, share project information, or maintain documentation archives.

### Key Highlights

- Fetch README files from public GitHub repositories.
- Upload local Markdown files.
- Drag and drop Markdown documents into the application.
- Preview rendered documentation before exporting.
- Search documentation and navigate its structure.
- Export documentation as a PDF.
- Use a sample document to explore the application.
- Access the application through a responsive web interface.

## Features

### 1. GitHub Repository Integration

Convert documentation from a public GitHub repository.

- Enter a GitHub repository URL.
- Fetch the repository's README documentation.
- Preview the retrieved content.
- Review the documentation before exporting.
- Handle invalid repository URLs and fetching errors through the application interface.

Example repository:

`https://github.com/Codewithajoydas/Portfolio-of-Ajoy-Das`

The application supports public repositories containing a README file. Private repositories may require authentication and are not assumed to be supported.

### 2. Local Markdown Upload

Convert your own Markdown documents without publishing them to GitHub.

- Select a `.md` or `.markdown` file.
- Drag and drop files into the upload area.
- View the selected file's name and size.
- Remove a selected file before processing.
- Generate a PDF from the uploaded document.

**Maximum supported file size:** 5 MB.

### 3. Markdown Preview

Review your documentation in a readable format before exporting it.

The Markdown rendering workflow is designed to support common documentation elements, including:

- Headings and paragraphs
- Bold and italic text
- Ordered and unordered lists
- Links and images
- Tables
- Blockquotes
- Inline code and fenced code blocks
- Horizontal rules

The final appearance depends on the source Markdown and the application's rendering and PDF-export implementation.

### 4. Documentation Navigation and Search

Explore longer README files more efficiently.

The application's documentation workflow includes tools for finding content and navigating the document.

- Search for relevant text.
- Navigate document sections through an outline.
- Switch between rendered Markdown and raw Markdown.
- Copy documentation content where supported.
- Review document statistics.

### 5. PDF Export

Generate a printable PDF from the selected documentation.

The export workflow is designed to preserve the document's structure and improve readability.

- Convert rendered documentation into PDF output.
- Preserve headings, paragraphs, lists and other supported Markdown elements.
- Include supported images and links.
- Configure available export presentation settings.
- Download the generated document through the browser.

**Note:** Exact page-size, orientation, footer and other layout options depend on the active PDF-export implementation. Verify each setting in the application before relying on it for production documents.

### 6. Sample Document

Explore the application without preparing a repository URL or Markdown file.

The sample-loading option provides a convenient way to understand the document-loading and conversion workflow before using your own content.

### 7. User Interface

The application provides a straightforward interface for the conversion process.

- Separate input options for GitHub repositories and Markdown uploads.
- Clear actions for loading a sample and generating output.
- File removal controls.
- Success and error feedback.
- Responsive layout for different screen sizes.
- Theme and presentation features where implemented.

---

## How to Use

### Method 1: Convert a GitHub README

1. Open the [CWAD Repo to PDF application](https://cwad-repo-to-pdf.codewithajoydas.in/).
2. Select the GitHub repository input option.
3. Enter the URL of a public GitHub repository.
4. Click **Generate README**.
5. Wait for the README to load.
6. Review the generated documentation.
7. Use the available PDF export action to create your document.
8. Save the PDF when prompted by the browser.

### Method 2: Convert a Local Markdown File

1. Open the application.
2. Select the Markdown upload option.
3. Click **Choose Markdown file**, or drag and drop a file onto the upload area.
4. Select a `.md` or `.markdown` document.
5. Review the selected file and its contents.
6. Generate the PDF.
7. Open the downloaded document and verify its formatting.

### Method 3: Try the Sample

1. Open the application.
2. Click **Load sample**.
3. Review the example documentation.
4. Explore the available preview and export controls.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Static typing and maintainable application code |
| Vite 7 | Development server and production build tooling |
| React Router 7 | Client-side routing |
| TanStack Query | Asynchronous data and query management |
| Axios | HTTP requests |
| Marked | Markdown parsing |
| DOMPurify | HTML sanitization |
| html2pdf.js | Browser-side PDF generation |
| Zod | Schema validation |
| Vitest | Automated testing |
| Testing Library | React component testing |
| ESLint | Code quality and linting |
| Prettier | Code formatting |

---

## Project Architecture

The application uses React and TypeScript, with Vite providing the development and production build workflow.

Its primary responsibilities can be understood as follows:

1. **Input handling:** Accept repository URLs or local Markdown files.
2. **Document retrieval:** Fetch supported GitHub documentation.
3. **Markdown processing:** Parse Markdown into rendered content.
4. **Preview and navigation:** Display the document and help users explore its contents.
5. **PDF generation:** Convert the rendered document into a downloadable PDF.
6. **User feedback:** Communicate loading, success and error states.

### Core Processing Flow

```text
                  User Input
                      |
           +----------+----------+
           |                     |
     GitHub Repository      Local Markdown
           |                     |
      Fetch README          Read File
           |                     |
           +----------+----------+
                      |
               Markdown Content
                      |
              Parse and Render
                      |
             Preview and Review
                      |
                PDF Export
                      |
                Download PDF
```

---

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js with npm
- Git
- A modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/Codewithajoydas/cwad-repo_to_pdf.git
```

### 2. Navigate to the Project

```bash
cd cwad-repo_to_pdf
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Vite will display a local URL in the terminal. Open that URL in your browser.

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Runs TypeScript project builds and creates the production bundle |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint |
| `npm run lint:fix` | Automatically fixes supported ESLint issues |
| `npm run format` | Formats project files using Prettier |
| `npm run format:check` | Checks formatting without rewriting files |
| `npm run typecheck` | Runs TypeScript type checking |
| `npm test` | Runs the Vitest test suite |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run test:coverage` | Runs tests with coverage reporting |

These commands are defined in the repository's `package.json`.

---

## Environment Configuration

The application is a client-side web application. The repository includes an `.env.example` file inherited from its starter setup.

Before adding environment variables, check whether the application actually reads them. Do not add unnecessary API configuration or secrets to the frontend.

If you introduce a GitHub token or another secret in a future version, do not expose it through a `VITE_` environment variable, because Vite exposes such variables to client-side code.

---

## PDF Export Workflow

A typical conversion involves the following stages:

1. Obtain the Markdown content from GitHub or a local file.
2. Parse the Markdown into structured content.
3. Render the document in the browser.
4. Prepare the document for export.
5. Generate the PDF.
6. Deliver the file through the browser's download mechanism.

PDF quality can depend on document length, font availability, image loading, table width, code-block wrapping and page-break behavior.

For important documents, inspect the exported PDF before sharing it.

---

## Error Handling and Limitations

Consider the following when using the application:

- **Invalid repository URL:** Verify that the supplied URL points to the intended GitHub repository.
- **Missing README:** The repository must contain a README at a supported location.
- **Private repositories:** Authentication is not guaranteed; the documented workflow targets public repositories.
- **GitHub API limits:** Unauthenticated API requests may be rate-limited.
- **Large Markdown files:** Local uploads are limited to 5 MB.
- **External images:** Image loading depends on the image URL and browser access.
- **Complex Markdown:** Some GitHub-specific syntax may render differently from GitHub itself.
- **PDF layout:** Long code blocks, wide tables and large images may need special formatting.
- **Browser downloads:** Download behavior depends on the browser and its settings.

---

## Security Considerations

- Sanitize rendered HTML before inserting it into the document.
- Treat repository content and uploaded Markdown as untrusted input.
- Avoid exposing API tokens or private credentials in client-side code.
- Validate file types and file sizes before processing uploads.
- Handle external links and image URLs carefully.
- Keep dependencies updated and review security advisories.

---

## Testing and Quality Checks

Run the available checks before submitting changes or preparing a deployment.

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Test the following workflows when making changes:

- Valid and invalid GitHub repository URLs.
- Repositories with missing README files.
- Valid and invalid Markdown uploads.
- Drag-and-drop file selection.
- Large documents and long code blocks.
- Markdown rendering and navigation.
- PDF generation and download.
- Image loading and page-break behavior.
- Responsive layouts and browser compatibility.

Automated test coverage depends on the tests implemented in the repository.

---

## Deployment

The application is available on Vercel:

**Live application:** https://cwad-repo-to-pdf.vercel.app/

To deploy an updated version:

1. Push the project to GitHub.
2. Import the repository into Vercel, if it is not already connected.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Deploy the application.
6. Test the deployed URL, including GitHub fetching, local uploads and PDF downloads.

No backend service is assumed to be necessary for the core browser-based workflow. Additional infrastructure may be required if future features introduce authenticated API access or server-side processing.

---

## Future Improvements

Potential enhancements include:

- More comprehensive PDF layout controls.
- Page numbers, headers and footers.
- Improved page-break handling for code blocks and tables.
- Better handling of GitHub-specific Markdown extensions.
- Custom themes and typography.
- Improved accessibility and keyboard navigation.
- Additional automated tests for PDF output.
- Support for selecting a branch or a specific README path.
- Improved error messages and retry behavior.
- More detailed export previews.

These items are possible future enhancements, not a claim that they are all currently implemented.

---

## Contributing

Contributions, bug reports and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Run the project's quality checks.
5. Commit your changes with a descriptive message.
6. Open a pull request explaining the changes.

For bugs or feature requests, use the [GitHub Issues page](https://github.com/Codewithajoydas/cwad-repo_to_pdf/issues).

---

## License

Check the repository for a `LICENSE` file before redistributing this project. No specific license is asserted here.

---

## Author

**Ajoy Das**

- GitHub: [@Codewithajoydas](https://github.com/Codewithajoydas)
- Project: [CWAD Repo to PDF](https://github.com/Codewithajoydas/cwad-repo_to_pdf)
- Live Demo: [cwad-repo-to-pdf.vercel.app](https://cwad-repo-to-pdf.vercel.app/)

---

If this project is useful to you, consider starring the repository and sharing feedback through GitHub Issues.
