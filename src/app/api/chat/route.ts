import { NextResponse } from 'next/server'
import type { ChatRequest, ChatResponse } from '@/lib/contracts/chat'

export async function POST(req: Request) {
	const body = (await req.json()) as ChatRequest

	if (!body.repoId) {
		return NextResponse.json({ error: 'repoId required' }, { status: 400 })
	}

	const lastUserMessage = body.messages.at(-1)?.content ?? ''

	const response: ChatResponse = {
		message: {
			role: 'assistant',
			content: `Authentication is handled using JWT verification logic.`,
			citations: [
				{
					path: 'src/auth/jwt.ts',
					startLine: 32,
					endLine: 78,
					symbol: 'verifyToken',
				},
			],
		},
	}

	return NextResponse.json(response)
}
