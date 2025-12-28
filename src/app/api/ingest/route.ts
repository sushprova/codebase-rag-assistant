export const runtime = "nodejs";

import { cleanupRepo } from "@/server/ingestion/cleanup";
import { cloneRepo } from "@/server/ingestion/cloneRepo";
import { readRepoFiles } from "@/server/ingestion/readRepoFiles";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { repoUrl } = await req.json();

	if (!repoUrl) {
		return NextResponse.json({ error: "repoUrl required" }, { status: 400 });
	}

	let repoDir: string | null = null;

	try {
		repoDir = await cloneRepo(repoUrl);

		const files = await readRepoFiles(repoDir);

		return NextResponse.json({
			filesProcessed: files.length,
			preview: files.slice(0, 3),
		});
	} finally {
		if (repoDir) {
			await cleanupRepo(repoDir);
		}
	}
}
