# HOME key action (beginning-of-text) for Obsidian

This plugin provides a command that mimics and enhances the behavior of the HOME key.
It allows you to bind a "smart" home-key action to any hotkey, such as Control+A for macOS-style (and Emacs-style) navigation.

On macOS, for example, Control+A typically moves the cursor to the absolute beginning of the line.
However, Command+Left moves it to the beginning of the text, intelligently handling indentation.
This plugin allows you to bind Ctrl+A to smart behavior like Command+Left.

## command: Normal (consider indents / lists / tasklists / quotes)

When executed, the cursor moves to the beginning of the text content (after indentation/markers) instead of the absolute left edge of the line.
Executing it again toggles the cursor to the absolute beginning of the line.

When the pipe character "|" represents the cursor position;

```
   some indented text|
(exec this command)
   |some indented text
(exec again)
|   some indented text

   - some list item|
   - |some list item
|  - some list item

   - [ ] some task list item|
   - [ ] |some task list item
|  - [ ] some task list item

   1. some numbered list item|
   1. |some numbered list item
|  1. some numbered list item

   > some quoted text|
   > |some quoted text
|  > some quoted text
```

- Unordered list line begins with `- `, `* `, or `+ `.
- Task list line begins with `- [ ] `, `* [ ] `, or `+ [ ] `.
- Ordered list line begins with `1. ` or `1) `.
- Quoted text line begins with `>`.

Refer to: https://help.obsidian.md/syntax
- [Lists](https://help.obsidian.md/syntax#Lists) /
- [Task lists](https://help.obsidian.md/syntax#Task+lists) /
- [Quotes](https://help.obsidian.md/syntax#Quotes) /

## command: Advanced (+ headings / footnotes)

In addition to the "Normal" features, this command also recognizes headings and footnotes.

```
## heading line|
(exec Advanced command)
## |heading line
(exec again)
|## heading line

[^1]: some footnote text|
[^1]: |some footnote text
|[^1]: some footnote text
```
- Heading begins with `# ` through `###### `. (Level 1-6)
- Footnote begins with `[^1]: `.

Refer to: https://help.obsidian.md/syntax
[Headings](https://help.obsidian.md/syntax#Headings) /
[Footnotes](https://help.obsidian.md/syntax#Footnotes) /

# Use Cases
## Mac
Simply bind the hotkey for this command to Control+A.
Please use either Normal or Advanced according to your preference.

## Windows
Used in combination with **[obsidian-emacs-text-editor](https://github.com/Klojer/obsidian-emacs-text-editor)**,
giving up on the OS standard select-all shortcut,
bind the hotkey to this command instead of `beginning-of-line` to Ctrl+A.

# Installation
```
$ npm install
$ npm run dev
```

# Tips: Overriding the HOME key
You can bind the Advanced command directly to the physical HOME key.
This extends the standard HOME key functionality to be aware of heading Markdown syntax, at your own risk.

Excerpt from `.obsidian/hotkeys.json`
```
  "homekey-action:advanced-homekey": [
    {
      "modifiers": [
      ],
      "key": "Home"
    },
    {
      "modifiers": [
        "Ctrl"
      ],
      "key": "A"
    }
  ],
```


# Known Limitations
- **Logical Line Only:** Currently, this plugin moves the cursor based on logical lines.
It does not yet support "visual line" movement (wrapped lines) found in some native macOS behaviors.
- **Tables:** Smart cursor movement within table cells is not currently supported.
