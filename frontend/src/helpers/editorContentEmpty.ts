export function isEditorContentEmpty(content: string): boolean {
	return content === '' || content === '<p></p>'
}

export function plainTextFromEditor(content: string): string {
	if (isEditorContentEmpty(content)) {
		return ''
	}

	const doc = new DOMParser().parseFromString(content, 'text/html')
	return (doc.body.textContent || '').trim()
}

export function editorHtmlFromPlainText(text: string): string {
	const trimmed = text.trim()
	if (trimmed === '') {
		return ''
	}

	const escaped = trimmed
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')

	return escaped
		.split('\n')
		.map(line => `<p>${line || '<br>'}</p>`)
		.join('')
}
