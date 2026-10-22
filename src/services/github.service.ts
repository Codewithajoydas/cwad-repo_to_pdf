import type { ReadmeData } from "@/types/readme.types";

export async function fetchReadme(
  owner: string,
  repo: string
): Promise<ReadmeData> {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (response.status === 404) {
    throw new Error(
      "README not found. Check the repository URL."
    );
  }

  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub API rate limit reached.");
  }

  if (!response.ok) {
    throw new Error("Unable to fetch README from GitHub.");
  }

  const data: {
    content: string;
    encoding: string;
  } = await response.json();

  if (data.encoding !== "base64") {
    throw new Error("Unsupported README encoding.");
  }

  const binary = atob(data.content.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );

  const repositoryResponse = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!repositoryResponse.ok) {
    throw new Error("Unable to fetch repository information from GitHub.");
  }

  const repositoryData: { default_branch: string } =
    await repositoryResponse.json();

  return {
    markdown: new TextDecoder().decode(bytes),
    repository: `${owner}/${repo}`,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    defaultBranch: repositoryData.default_branch,
  };
}