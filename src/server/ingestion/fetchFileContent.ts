export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();

  if (!data.content) return null;

  return Buffer.from(data.content, "base64").toString("utf-8");
}
