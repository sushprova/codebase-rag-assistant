// src/hooks/use-repo-status.ts
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Repo, RepoStatus } from '@/lib/contracts/repos'

type UseRepoStatusArgs = {
	repoId: string | null
	enabled?: boolean
	intervalMs?: number
}

export function useRepoStatus({ repoId, enabled = true, intervalMs = 1500 }: UseRepoStatusArgs) {
	const [repo, setRepo] = useState<Repo | null>(null)
	const [status, setStatus] = useState<RepoStatus | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const stopRef = useRef(false)

	const shouldPoll = useMemo(() => {
		if (!enabled) return false
		if (!repoId) return false
		if (!status) return true // first fetch

		return status === 'INDEXING' || status === 'PENDING'
	}, [enabled, repoId, status])

	useEffect(() => {
		stopRef.current = false

		return () => {
			stopRef.current = true
		}
	}, [repoId])

	useEffect(() => {
		if (!shouldPoll) return

		let timer: ReturnType<typeof setTimeout> | null = null

		const tick = async () => {
			if (!repoId) return
			setIsLoading(true)
			setError(null)

			try {
				const res = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, { method: 'GET' })
				if (!res.ok) {
					const json = (await res.json().catch(() => null)) as any
					throw new Error(json?.error ?? `Failed to fetch repo status (${res.status})`)
				}

				const json = (await res.json()) as { repo: Repo }
				setRepo(json.repo)
				setStatus(json.repo.status)
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Unknown error'
				setError(msg)
			} finally {
				setIsLoading(false)
				if (!stopRef.current) {
					timer = setTimeout(tick, intervalMs)
				}
			}
		}

		void tick()

		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [repoId, shouldPoll, intervalMs])

	return { repo, status, isLoading, error }
}
