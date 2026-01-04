import { Editor, Plugin } from 'obsidian';
import { syntaxTree } from '@codemirror/language';

export default class HomekeyActionPlugin extends Plugin {

	CELL_SEPARATOR_REGEX = /(?<!\\)\|/g;

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

		this.addCommand({
			id: 'cursor-up',
			name: 'Cursor UP',
			editorCallback: (editor: Editor, _: MarkdownView) => {
				this.cursorUpAction(editor)
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
		if (this.isPositionInTable(editor)) {
			position = this.getBeginningOfCellPosition(line, position);
		} else {
			position = this.getBeginningOfLinePosition(line, position, isAdvanced);
		}
		editor.setCursor({ line: cursor.line, ch: position });
	}


	isPositionInTable(editor: Editor, line?: number, ch?: number): boolean {
		const cm = (editor as any).cm;
		if (!cm) return false;

		const posObj = (line !== undefined && ch !== undefined)
			? { line, ch }
			: editor.getCursor();
		const pos = editor.posToOffset(posObj);

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

		if (this.isPositionInTable(editor)) {
			position = this.getEndOfCellPosition(line, position);
		} else {
			position = line.length;
		}
		editor.setCursor({ line: cursor.line, ch: position });
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

		if (nextPipeEndIndex !== -1) {
			const searchArea = line.slice(nextPipeIndex + 1, nextPipeEndIndex);
			const startOffset = searchArea.search(/\S|$/);
			return nextPipeIndex + 1 + startOffset;
		} else {
			return ch;
		}
	}


	cursorUpAction(editor: Editor) {
		const cursor = editor.getCursor();

		// Top of file
		if (cursor.line == 0) {
			// If it is the first line of the file, goUP is OK even if it is in a table.
			editor.exec('goUp');
			return;
		}

		const line = editor.getLine(cursor.line);
		const ch = cursor.ch;
		if (!this.isPositionInTable(editor)) {
			// Out of table

			if (this.isPositionInTable(editor, cursor.line - 1, 1)) {
				// Line directly below the table, move the cursor to -1 row instead of goUP.
				const targetCh = this.getChByCellIndex(editor, cursor.line - 1, 0);
				editor.setCursor({ line: cursor.line - 1, ch: targetCh });
				return;
			} else {
				editor.exec('goUp');
				return;
			}

		} else {
			// In the table

			const lastPipeIndex = line.lastIndexOf('|', ch - 1);
			if (lastPipeIndex === -1) return;

			// Locate the first non-space character in the current cell
			const startOffset = line.slice(lastPipeIndex + 1).search(/\S|$/);
			const startOfCellContent = lastPipeIndex + 1 + startOffset;

			if (ch !== startOfCellContent) {
				// In cell goUP
				editor.exec('goUp');
				return;
			} else {
				// At the beginning of the text in a cell, move to the beginning of the same cell one row above
				const cellIndex = this.getCellIndex(line, ch);
				this.setCursorToPrevRow(editor, cellIndex);
				return;
			}
		}
	}


	getCellIndex(line: string, ch: number): number {
		const textBeforeCursor = line.substring(0, ch);
		const matches = textBeforeCursor.match(this.CELL_SEPARATOR_REGEX);

		if (!matches) return 0;

		return matches.length - 1;
	}


	// Moves the cursor to the beginning of the specified column number in the row above the current row.
	// It has been confirmed that it is inTable and cursor.line>0.
	//
	// (*1)
	//			    <-- BlankLine
	// | header | (*2)header |  <-- HeaderRow
	// | ------ | ---------- |  <-- DelimiterLine
	// | text   | (*3)text   |  <-- FirstDataRow
	// | text   | (*4)text   |
	// | text   | (*5)text   |
	//
	// (*2)->(*1) if (cursor.line+1) is DelimiterLine, go out of the table.
	// (*3)->(*2) if (cursor.line-1) is DelimiterLine, go to same column at (cursor.line-2).
	// (*4)->(*3),(*5)->(*4) simply go to (cursor.line-1).
	//
	setCursorToPrevRow(editor: Editor, cellIndex: number) {
		const cursor = editor.getCursor();
		let targetLine = cursor.line;
		let targetCh = 0;

		if (!this.isPositionInTable(editor, cursor.line - 1, 1)) {
			// Above row is out-of-table, i.e., Header row. (*2)
			targetLine -= 2;	// (*2)->(*1)
			targetCh = 0;		// left edge of line
		} else {
			// Above row is in-table, i.e., Data row: (*3)(*4)(*5)
			const oneLineUp = editor.getLine(cursor.line - 1);
			const isDelimiterLineAbove = /^\s*\|?[:\s-]+\|[:\s- |]*$/.test(oneLineUp);

			if (isDelimiterLineAbove) {
				targetLine -= 2;	// (*3)->(*2)
			} else {
				targetLine --;		// (*4)->(*3),(*5)->(*4)
			}
			targetCh = this.getChByCellIndex(editor, targetLine, cellIndex);
		}
		if (targetCh != -1) {
			// Use cm directly to avoid interference with the table editor
			const cm = (editor as any).cm;
			const pos = editor.posToOffset({ line: targetLine, ch: targetCh });
			cm.dispatch({
			        selection: { anchor: pos, head: pos }
			});
			cm.focus();
		}
	}


	getChByCellIndex(editor: Editor, line: number, cellIndex: number): number {
		const lineText = editor.getLine(line);
		const matches = [...lineText.matchAll(this.CELL_SEPARATOR_REGEX)];

		if (cellIndex >= 0 && cellIndex < matches.length) {
			const pipeIndex = matches[cellIndex].index!;
			const afterPipe = lineText.substring(pipeIndex + 1);
			const firstNonSpaceMatch = afterPipe.search(/\S/);

			return pipeIndex + 1 + (firstNonSpaceMatch !== -1 ? firstNonSpaceMatch : 0);
		}

		return -1;
	}
}
