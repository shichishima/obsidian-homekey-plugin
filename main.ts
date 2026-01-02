import { Editor, Plugin } from 'obsidian';
import { syntaxTree } from '@codemirror/language';

export default class HomekeyActionPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'normal-homekey',
			name: 'Normal (consider indents / lists / task lists)',
			editorCallback: (editor: Editor, _: MarkdownView) => {
				this.smartHomeAction(editor, false)
			}
		});

		this.addCommand({
			id: 'advanced-homekey',
			name: 'Advanced (+ headings)',
			editorCallback: (editor: Editor, _: MarkdownView) => {
				this.smartHomeAction(editor, true)
			}
		});

	}

	onunload() {

	}

	smartHomeAction(editor: Editor, isAdvanced: boolean) {
		const cursor = editor.getCursor();
		let position = cursor.ch;
		if (position == 0) return;

		const line = editor.getLine(cursor.line);
		if (this.isCursorInTable(editor)) {
			position = this.getBeginningOfCellPosition(line, position);
		} else {
			position = this.getBeginningOfLinePosition(line, position, isAdvanced);
		}
		editor.setCursor({ line: cursor.line, ch: position })
	}

	isCursorInTable(editor: Editor): boolean {
		const cm = (editor as any).cm;
		if (!cm) return false;

		const pos = cm.state.selection.main.head
		const tree = syntaxTree(cm.state);

		let node = tree.resolveInner(pos, -1);
		while (node) {
			if (node.name.includes('Table') || node.name.includes('table')) {
				return true;
			}
			node = node.parent;
		}

		return false;
	}

	getBeginningOfCellPosition(line: string, ch: number): number {
		const lastPipeIndex = line.lastIndexOf('|', ch - 1);
		if (lastPipeIndex === -1) return 0;

		const startOffset = line.slice(lastPipeIndex + 1).search(/\S|$/);
		const startOfCellContent = lastPipeIndex + 1 + startOffset;

		if (ch > startOfCellContent) {
			return startOfCellContent;
		}

		const secondLastPipeIndex = line.lastIndexOf('|', lastPipeIndex - 1);
		if (secondLastPipeIndex !== -1) {
			const endOffset = line.slice(secondLastPipeIndex + 1, lastPipeIndex).trimEnd().length;
			return secondLastPipeIndex + 1 + endOffset;
		}

		return ch; // No left cell
	}

	getBeginningOfLinePosition(line: string, ch: number, isAdvanced: boolean): number {
		let result = null;

		if (isAdvanced) {
			// Headings
			// # or ## or... ###### (heading 1 to 6)
			result = line.match(/^#{1,6}\s/);

			if (result === null) {
				// Footnotes
				// [^1]: (not only number)
				result = line.match(/^\[\^.+\]:\s*/);
			}
		}

		if (result === null) {
			// Ordered lists
			// 1. or 1)
			result = line.match(/^\s*\d+[\.\)]\s/);
		}
		if (result === null) {
			// Quotes
			// >
			result = line.match(/^\s*>\s*/);
		}
		if (result === null) {
			// Indents, Unordered lists, Task lists
			// -     or *     or +
			// - [ ] or * [ ] or + [ ]
			result = line.match(/^\s*([-+*]\s(\[.\]\s)?)?/);
		}

		if (result !== null && result[0].length < ch) {
			return result[0].length;
		} else {
			return 0;
		}
	}
}
