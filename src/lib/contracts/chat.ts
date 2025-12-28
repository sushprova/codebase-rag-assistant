export type ChatMessage = {
	role: 'user' | 'assistant'
	content: string
}

export type Citation = {
	path: string
	startLine: number
	endLine: number
	symbol?: string
}

export type AssistantMessage = ChatMessage & {
	role: 'assistant'
	citations: Citation[]
}

export type ChatRequest = {
	repoId: string
	messages: ChatMessage[]
}

export type ChatResponse = {
	message: AssistantMessage
}
