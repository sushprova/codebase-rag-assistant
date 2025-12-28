'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Repo } from '@/lib/contracts/repos'
import type { Citation } from '@/lib/contracts/chat'
import { RepoBar } from '@/components/repo-bar'
import { ChatPanel } from '@/components/chat-panel'
import { CodeViewer } from '@/components/code-viewer'
import { useRepoStatus } from '@/hooks/use-repo-status'
import { Card } from '@/components/ui/card'

export default function HomePage() {
	const router = useRouter()
	const params = useSearchParams()

	const repoIdParam = params.get('repoId')
	const [repoId, setRepoId] = useState<string | null>(repoIdParam)
	const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)

	useEffect(() => {
		setRepoId(repoIdParam)
		setSelectedCitation(null)
	}, [repoIdParam])

	const onRepoCreated = (repo: Repo) => {
		setRepoId(repo.id)
		setSelectedCitation(null)

		const next = new URLSearchParams(params.toString())
		next.set('repoId', repo.id)
		router.replace(`/?${next.toString()}`)
	}

	const { repo } = useRepoStatus({ repoId, enabled: !!repoId })

	const chatDisabled = useMemo(() => {
		if (!repoId) return true

		return repo?.status !== 'READY'
	}, [repoId, repo?.status])

	return (
		<main className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
			<h1 className="text-2xl font-semibold">GitHub Codebase RAG Assistant</h1>

			<RepoBar repoId={repoId} onRepoCreated={onRepoCreated} />

			<div className="grid gap-4 lg:grid-cols-2">
				<div>
					{repoId ? (
						<ChatPanel
							repoId={repoId}
							disabled={chatDisabled}
							onCitationClick={(c) => setSelectedCitation(c)}
						/>
					) : (
						<Card className="rounded-xl p-4 text-sm text-muted-foreground">
							Paste a repo URL above to begin.
						</Card>
					)}
				</div>

				<div>
					{repoId ? (
						<CodeViewer
							repoId={repoId}
							citation={selectedCitation}
							onClear={() => setSelectedCitation(null)}
						/>
					) : (
						<Card className="rounded-xl p-4 text-sm text-muted-foreground">No repo selected.</Card>
					)}
				</div>
			</div>
		</main>
	)
}
