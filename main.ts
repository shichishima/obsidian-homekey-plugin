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

		this.addCommand({
			id: 'endkey',
			name: 'End key (smart end-of-text)',
			editorCallback: (editor: Editor, _: MarkdownView) => {
				this.smartEndAction(editor)
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

		// Locate the first non-space character in the current cell
		const startOffset = line.slice(lastPipeIndex + 1).search(/\S|$/);
		const startOfCellContent = lastPipeIndex + 1 + startOffset;
		if (ch > startOfCellContent) {
			return startOfCellContent;
		}

		// If already at the start, move to the end of the previous cell content.
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

	smartEndAction(editor: Editor) {
		const cursor = editor.getCursor();
		let position = cursor.ch;
		const line = editor.getLine(cursor.line);

		if (position === line.length) return;

		if (this.isCursorInTable(editor)) {
			position = this.getEndOfCellPosition(line, position);
		} else {
			position = line.length;
		}
		editor.setCursor({ line: cursor.line, ch: position })
	}

	getEndOfCellPosition(line: string, ch: number): number {
		const nextPipeIndex = line.indexOf('|', ch);

		// If no more pipes are found, move to the very end of the line.
		if (nextPipeIndex === -1) return line.length;

		// If the cursor is before the actual content ends, move to the end of the content (excluding trailing spaces).
		const cellContentBeforePipe = line.slice(0, nextPipeIndex);
		const contentEndOffset = cellContentBeforePipe.trimEnd().length;
		if (ch < contentEndOffset) {
			return contentEndOffset;
		}

		// If already at or past the content end, move to the start of the next cell's content.
		const nextPipeEndIndex = line.indexOf('|', nextPipeIndex + 1);
		const searchArea = nextPipeEndIndex === -1 ? line.slice(nextPipeIndex + 1) : line.slice(nextPipeIndex + 1, nextPipeEndIndex);

		const startOffset = searchArea.search(/\S|$/);
		return nextPipeIndex + 1 + startOffset;
	}

}
