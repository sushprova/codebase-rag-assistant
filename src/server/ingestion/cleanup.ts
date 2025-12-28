import fs from "fs/promises";

export async function cleanupRepo(dir: string) {
  await fs.rm(dir, { recursive: true, force: true });
}
