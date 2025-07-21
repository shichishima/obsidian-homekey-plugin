import { Editor, Plugin } from 'obsidian';

export default class HomekeyActionPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'normal-homekey',
			name: 'Normal (consider indents / lists / task lists)',
			editorCallback: (editor: Editor, _: MarkdownView) => {
				this.beginingOfLine(editor, false)
			}
		});

		this.addCommand({
			id: 'advanced-homekey',
			name: 'Advanced (+ headings)',
			editorCallback: (editor: Editor, _: MarkdownView) => {
				this.beginingOfLine(editor, true)
			}
		});

	}

	onunload() {

	}

	beginingOfLine(editor: Editor, isAdvanced: boolean) {
		const cursor = editor.getCursor()
		if (cursor.ch == 0) return;

		const line = editor.getLine(cursor.line)

		let result = null
		if (isAdvanced) {
			// Headings
			// # or ## or... ###### (heading 1 to 6)
			result = line.match(/^#{1,6}\s/)
		}

		if (result === null) {
			// Ordered lists
			// 1. or 1)
			result = line.match(/^\s*\d+[\.\)]\s/)
		}
		if (result === null) {
			// Indents, Unordered lists, Task lists
			// -     or *     or +
			// - [ ] or * [ ] or + [ ]
			result = line.match(/^\s*([-+*]\s(\[.\]\s)?)?/)
		}
		if (result !== null && result[0].length < cursor.ch) {
			editor.setCursor({ line: cursor.line, ch: result[0].length })
		} else {
			editor.setCursor({ line: cursor.line, ch: 0 })
		}
	}
}
