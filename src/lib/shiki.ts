import { createHighlighter } from 'shiki'

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

export async function getShikiHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ['github-dark', 'github-light'],
			langs: [
				'typescript',
				'javascript',
				'python',
				'java',
				'go',
				'json',
				'markdown',
				'bash',
				'text',
			],
		})
	}

	return highlighterPromise
}
