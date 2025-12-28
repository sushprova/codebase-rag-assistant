'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Citation } from '@/lib/contracts/chat'
import type { FileResponse } from '@/lib/contracts/files'

type CodeViewerProps = {
	repoId: string
	citation: Citation | null
	onClear?: () => void
}

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n))
}

export function CodeViewer({ repoId, citation, onClear }: CodeViewerProps) {
	const [file, setFile] = useState<FileResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Load highlighted HTML from API
	useEffect(() => {
		const load = async () => {
			if (!citation?.path) {
				setFile(null)
				setError(null)

				return
			}

			setIsLoading(true)
			setError(null)

			try {
				const res = await fetch(
					`/api/repos/${encodeURIComponent(repoId)}/file?path=${encodeURIComponent(citation.path)}`,
				)
				if (!res.ok) {
					const json = (await res.json().catch(() => null)) as any
					throw new Error(json?.error ?? `Failed to load file (${res.status})`)
				}

				const json = (await res.json()) as FileResponse
				setFile(json)
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Unknown error'
				setError(msg)
				setFile(null)
			} finally {
				setIsLoading(false)
			}
		}

		void load()
	}, [repoId, citation?.path])

	const highlight = useMemo(() => {
		if (!citation) return null
		// We don't know total line count in advance; clamp later after DOM is rendered.
		const start = Math.max(1, citation.startLine)
		const end = Math.max(start, citation.endLine)

		return { start, end }
	}, [citation])

	// Apply highlighting + scroll after HTML is rendered
	useEffect(() => {
		if (!file?.html || !highlight) return

		// Remove existing highlights
		const container = document.getElementById('code-viewer-shiki')
		if (!container) return

		const lineEls = Array.from(container.querySelectorAll('.line')) as HTMLElement[]
		if (!lineEls.length) return

		const start = clamp(highlight.start, 1, lineEls.length)
		const end = clamp(highlight.end, start, lineEls.length)

		lineEls.forEach((el, idx) => {
			const lineNo = idx + 1
			if (lineNo >= start && lineNo <= end) el.classList.add('bg-muted')
			else el.classList.remove('bg-muted')
		})

		lineEls[start - 1]?.scrollIntoView({ block: 'center' })
	}, [file?.html, highlight?.start, highlight?.end])

	return (
		<Card className="flex h-[500px] flex-col rounded-xl">
			<div className="flex items-center justify-between border-b p-3">
				<div className="min-w-0">
					<div className="font-medium">Code</div>
					<div className="truncate text-xs text-muted-foreground">
						{citation?.path ? citation.path : 'No file selected'}
					</div>
				</div>

				<Button variant="outline" size="sm" onClick={onClear} disabled={!citation}>
					Clear
				</Button>
			</div>

			<div className="flex-1 overflow-auto p-3">
				{!citation ? (
					<div className="text-sm text-muted-foreground">
						Click a citation from the chat to open code here.
					</div>
				) : isLoading ? (
					<div className="text-sm text-muted-foreground">Loading file…</div>
				) : error ? (
					<div className="text-sm text-destructive">{error}</div>
				) : !file ? (
					<div className="text-sm text-muted-foreground">No file loaded.</div>
				) : (
					<div
						id="code-viewer-shiki"
						className="text-xs"
						// Shiki output includes <pre class="shiki">...</pre>
						dangerouslySetInnerHTML={{ __html: file.html }}
					/>
				)}
			</div>
		</Card>
	)
}
