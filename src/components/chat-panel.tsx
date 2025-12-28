'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { ChatMessage, ChatResponse, Citation, AssistantMessage } from '@/lib/contracts/chat'

type UiMessage = ChatMessage | AssistantMessage

function hasCitations(m: UiMessage): m is AssistantMessage {
	return m.role === 'assistant' && Array.isArray((m as AssistantMessage).citations)
}

type ChatPanelProps = {
	repoId: string
	disabled?: boolean
	onCitationClick?: (citation: Citation) => void
}

export function ChatPanel({ repoId, disabled, onCitationClick }: ChatPanelProps) {
	const [messages, setMessages] = useState<UiMessage[]>([])
	const [input, setInput] = useState('')
	const [isSending, setIsSending] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const send = async () => {
		const text = input.trim()
		if (!text || disabled || isSending) return

		setError(null)

		const nextMessages: ChatMessage[] = [
			...messages.map((m) => ({ role: m.role, content: m.content })), // strip citations for API
			{ role: 'user', content: text },
		]

		// Optimistic render of the user message
		setMessages((prev) => [...prev, { role: 'user', content: text }])
		setInput('')
		setIsSending(true)

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ repoId, messages: nextMessages }),
			})

			if (!res.ok) {
				const json = (await res.json().catch(() => null)) as any
				throw new Error(json?.error ?? `Chat request failed (${res.status})`)
			}

			const json = (await res.json()) as ChatResponse
			setMessages((prev) => [...prev, json.message])
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error'
			setError(msg)

			// Optional: append an assistant error bubble (UI choice)
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', content: `Error: ${msg}`, citations: [] },
			])
		} finally {
			setIsSending(false)
		}
	}

	return (
		<Card className="flex h-[500px] flex-col rounded-xl">
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.map((m, i) => (
					<div key={i}>
						<div className="font-medium">{m.role === 'user' ? 'You' : 'Assistant'}</div>
						<div className="whitespace-pre-wrap text-sm">{m.content}</div>

						{hasCitations(m) && m.citations.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{m.citations.map((c, idx) => (
									<Button
										key={idx}
										variant="outline"
										size="sm"
										onClick={() => onCitationClick?.(c)}
									>
										{c.path}:{c.startLine}-{c.endLine}
									</Button>
								))}
							</div>
						)}
					</div>
				))}
			</div>

			<div className="border-t p-3">
				{error ? <div className="mb-2 text-sm text-destructive">{error}</div> : null}

				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask about the codebase..."
						disabled={disabled || isSending}
						onKeyDown={(e) => {
							if (e.key === 'Enter') send()
						}}
					/>
					<Button onClick={send} disabled={disabled || isSending || !input.trim()}>
						{isSending ? 'Sending…' : 'Send'}
					</Button>
				</div>
			</div>
		</Card>
	)
}
