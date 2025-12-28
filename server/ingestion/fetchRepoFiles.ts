import { parseGitHubRepo } from "@/lib/github";

const GITHUB_API = "https://api.github.com";

export async function fetchRepoFiles(repoUrl: string) {
  const { owner, repo } = parseGitHubRepo(repoUrl);

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/main?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch repo tree");
  }

  const data = await res.json();
  console.log("GitHub response status:", data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.tree.filter((item: any) => item.type === "blob");
}
