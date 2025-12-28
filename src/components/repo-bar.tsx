'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Repo, RepoStatus } from '@/lib/contracts/repos'
import { useRepoStatus } from '@/hooks/use-repo-status'

function statusVariant(status: RepoStatus | null): 'default' | 'secondary' | 'destructive' | 'outline' {
	if (!status) return 'outline'
	if (status === 'READY') return 'default'
	if (status === 'FAILED') return 'destructive'
	if (status === 'INDEXING') return 'secondary'

	return 'outline'
}

function statusLabel(status: RepoStatus | null) {
	if (!status) return '—'

	return status
}

type RepoBarProps = {
	initialRepoUrl?: string
	repoId: string | null
	onRepoCreated: (repo: Repo) => void
}

export function RepoBar({ initialRepoUrl = '', repoId, onRepoCreated }: RepoBarProps) {
	const [repoUrl, setRepoUrl] = useState(initialRepoUrl)
	const [createError, setCreateError] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const { repo, status, isLoading, error } = useRepoStatus({ repoId, enabled: !!repoId })

	const effectiveStatus = repo?.status ?? null
	const progressText = useMemo(() => {
		const p = repo?.progress
		if (!p) return null

		return `${p.filesProcessed} files • ${p.chunksEmbedded} chunks`
	}, [repo?.progress])

	const onIndex = async () => {
		setCreateError(null)
		setIsCreating(true)
		try {
			const res = await fetch('/api/repos', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ repoUrl }),
			})

			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as any
				throw new Error(json?.error ?? `Failed to create repo (${res.status})`)
			}

			const json = (await res.json()) as { repo: Repo }
			onRepoCreated(json.repo)
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error'
			setCreateError(msg)
		} finally {
			setIsCreating(false)
		}
	}

	return (
		<div className="flex flex-col gap-2 rounded-xl border p-4">
			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<div className="flex-1">
					<Input
						value={repoUrl}
						onChange={(e) => setRepoUrl(e.target.value)}
						placeholder="https://github.com/owner/repo"
						disabled={isCreating || effectiveStatus === 'INDEXING'}
					/>
				</div>

				<div className="flex items-center gap-2">
					<Button onClick={onIndex} disabled={!repoUrl.trim() || isCreating}>
						{isCreating ? 'Indexing…' : 'Index repo'}
					</Button>

					<Badge variant={statusVariant(effectiveStatus)}>{statusLabel(effectiveStatus)}</Badge>
				</div>
			</div>

			<div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
				<div>
					{repo ? (
						<span>
							Repo: <span className="font-medium text-foreground">{repo.owner}/{repo.name}</span>
							{' '}
							{progressText ? <span className="ml-2">({progressText})</span> : null}
							{isLoading ? <span className="ml-2">(refreshing)</span> : null}
						</span>
					) : (
						<span>Paste a repo URL to begin.</span>
					)}
				</div>

				<div className="text-right">
					{createError ? <span className="text-destructive">{createError}</span> : null}
					{!createError && error ? <span className="text-destructive">{error}</span> : null}
				</div>
			</div>
		</div>
	)
}
