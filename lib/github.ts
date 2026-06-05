const GITHUB_REPO_API_URL = "https://api.github.com/repos/starc007/ui-components";

export async function getGithubStarCount(): Promise<number | null> {
  try {
    const response = await fetch(GITHUB_REPO_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "stargazers_count" in data &&
      typeof data.stargazers_count === "number"
    ) {
      return data.stargazers_count;
    }
  } catch {
    return null;
  }

  return null;
}
