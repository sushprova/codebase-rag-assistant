import simpleGit from "simple-git";
import os from "os";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function cloneRepo(repoUrl: string) {
  const tempDir = path.join(os.tmpdir(), "rag-repos", crypto.randomUUID());

  await fs.mkdir(tempDir, { recursive: true });

  const git = simpleGit();

  await git.clone(repoUrl, tempDir, [
    "--depth",
    "1", // shallow clone
  ]);

  return tempDir;
}
