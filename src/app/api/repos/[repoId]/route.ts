import { NextResponse } from 'next/server'
import type { GetRepoResponse, Repo } from '@/lib/contracts/repos'

const memory = globalThis as unknown as {
	__ragRepos?: Map<string, Repo>
	__ragRepoPolls?: Map<string, number>
}

function getStore() {
	memory.__ragRepos ??= new Map()
	memory.__ragRepoPolls ??= new Map()

	return { repos: memory.__ragRepos, polls: memory.__ragRepoPolls }
}

export async function GET(_req: Request, ctx: { params: Promise<{ repoId: string }> }) {
	const { repoId } = await ctx.params
	const { repos, polls } = getStore()

	const repo = repos.get(repoId)
	if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

	// Mock progression: after 4 polls -> READY
	const pollCount = (polls.get(repoId) ?? 0) + 1
	polls.set(repoId, pollCount)

	const now = new Date().toISOString()

	if (repo.status === 'INDEXING') {
		const filesProcessed = Math.min(500, (repo.progress?.filesProcessed ?? 0) + 80)
		const chunksEmbedded = Math.min(9000, (repo.progress?.chunksEmbedded ?? 0) + 1200)

		repo.progress = { filesProcessed, chunksEmbedded }
		repo.updatedAt = now

		if (pollCount >= 4) {
			repo.status = 'READY'
			repo.progress = { filesProcessed: 512, chunksEmbedded: 8421 }
			repo.lastIndexedCommitSha = 'mock_sha_abcdef123456'
			repo.updatedAt = now
		}

		repos.set(repoId, repo)
	}

	const res: GetRepoResponse = { repo }

	return NextResponse.json(res, { status: 200 })
}
