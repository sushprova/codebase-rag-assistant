import fs from "fs/promises";
import path from "path";
import { isCodeFile } from "../../../lib/codeFilter";

export async function readRepoFiles(dir: string) {
	const results: { path: string; content: string }[] = [];

	async function walk(current: string) {
		const entries = await fs.readdir(current, {
			withFileTypes: true,
		});

		for (const entry of entries) {
			const fullPath = path.join(current, entry.name);

			if (entry.isDirectory()) {
				if (entry.name === "node_modules" || entry.name === ".git") {
					continue;
				}
				await walk(fullPath);
			} else {
				if (!isCodeFile(entry.name)) continue;

				const content = await fs.readFile(fullPath, "utf-8");

				results.push({
					path: fullPath,
					content,
				});
			}
		}
	}

	await walk(dir);

	return results;
}
