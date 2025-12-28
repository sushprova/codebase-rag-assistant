import { NextResponse } from 'next/server'
import type { CreateRepoRequest, CreateRepoResponse, Repo } from '@/lib/contracts/repos'

const memory = globalThis as unknown as {
	__ragRepos?: Map<string, Repo>
	__ragRepoPolls?: Map<string, number>
}

function getStore() {
	memory.__ragRepos ??= new Map()
	memory.__ragRepoPolls ??= new Map()

	return { repos: memory.__ragRepos, polls: memory.__ragRepoPolls }
}

function parseGitHubUrl(repoUrl: string): { owner: string; name: string } {
	// Accept: https://github.com/owner/name or owner/name
	const trimmed = repoUrl.trim()
	if (!trimmed) throw new Error('Repo URL is required.')

	if (trimmed.includes('github.com')) {
		const u = new URL(trimmed)
		const parts = u.pathname.split('/').filter(Boolean)
		if (parts.length < 2) throw new Error('Invalid GitHub repo URL.')

		return { owner: parts[0], name: parts[1].replace(/\.git$/, '') }
	}

	// owner/name form
	const parts = trimmed.split('/').filter(Boolean)
	if (parts.length !== 2) throw new Error('Invalid repo format. Use https://github.com/owner/name or owner/name.')

	return { owner: parts[0], name: parts[1].replace(/\.git$/, '') }
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as CreateRepoRequest
		const { owner, name } = parseGitHubUrl(body.repoUrl)

		const { repos, polls } = getStore()

		const id = `repo_${Math.random().toString(36).slice(2, 10)}`
		const now = new Date().toISOString()

		const repo: Repo = {
			id,
			owner,
			name,
			repoUrl: body.repoUrl,
			status: 'INDEXING',
			defaultBranch: 'main',
			lastIndexedCommitSha: null,
			progress: { filesProcessed: 0, chunksEmbedded: 0 },
			error: null,
			createdAt: now,
			updatedAt: now,
		}

		repos.set(id, repo)
		polls.set(id, 0)

		const res: CreateRepoResponse = { repo }

		return NextResponse.json(res, { status: 200 })
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error'

		return NextResponse.json({ error: msg }, { status: 400 })
	}
}
