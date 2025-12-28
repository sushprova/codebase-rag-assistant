import { getShikiHighlighter } from '@/lib/shiki'
import { NextResponse } from 'next/server'

function languageFromPath(path: string): string {
	const ext = path.split('.').pop()?.toLowerCase()
	switch (ext) {
		case 'ts':
		case 'tsx':
			return 'typescript'
		case 'js':
		case 'jsx':
			return 'javascript'
		case 'py':
			return 'python'
		case 'java':
			return 'java'
		case 'go':
			return 'go'
		case 'cs':
			return 'csharp'
		case 'json':
			return 'json'
		case 'md':
			return 'markdown'
		default:
			return 'text'
	}
}

const MOCK_FILES: Record<string, string> = {
	'src/auth/jwt.ts': `import jwt from 'jsonwebtoken'

export function verifyToken(token: string) {
  if (!token) {
    throw new Error('missing token')
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!)
  return decoded
}

export function signToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' })
}
`,
}

export async function GET(req: Request) {
	const url = new URL(req.url)
	const path = url.searchParams.get('path')

	if (!path) {
		return NextResponse.json({ error: 'path query param is required' }, { status: 400 })
	}

	const content = MOCK_FILES[path]
	if (!content) {
		return NextResponse.json({ error: `File not found: ${path}` }, { status: 404 })
	}

	const highlighter = await getShikiHighlighter()

	const language = languageFromPath(path)
	const html = highlighter.codeToHtml(content, {
		lang: language,
		theme: 'github-light',
	})

	return NextResponse.json({
		path,
		language,
		html,        // highlighted HTML
		raw: content // optional, keep for later features
	})
}
