export interface ReadmeData {
  defaultBranch(markdown: string, repository: string, defaultBranch: unknown): string | TrustedHTML;
  markdown: string;
  repository: string;
}

export type ReadmeView = "preview" | "markdown";