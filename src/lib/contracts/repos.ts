export type RepoStatus = 'PENDING' | 'INDEXING' | 'READY' | 'FAILED'

export type Repo = {
	id: string
	owner: string
	name: string
	repoUrl: string
	status: RepoStatus
	defaultBranch?: string | null
	lastIndexedCommitSha?: string | null
	progress?: { filesProcessed: number; chunksEmbedded: number } | null
	error?: string | null
	createdAt: string
	updatedAt: string
}

export type CreateRepoRequest = { repoUrl: string }
export type CreateRepoResponse = { repo: Repo }

export type GetRepoResponse = { repo: Repo }
