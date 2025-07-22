# HOME key action (beginning-of-text) for Obsidian

This plugin provides a command that acts like the HOME key.
This allows you to set HOME key action to a hotkey.

For example, on a Mac, Control+A always moves the cursor to the left edge of the line, but Command+Left moves the cursor to the begining of the text, taking into account indents and markdowns at the beginning of the line.

You can bind this command to a hotkey to make Control+A the same as Command+Left.

Even on Windows, if you are using Emacs-type key bindings, you can make Ctrl+A act like the HOME key.

## command: Normal (consider indents / lists / tasklists)

Execute this command on the line of indent or list text,
the cursor will move to the beginning of the indented text
instead of the left edge of the line.

When pipe character "|" is cursor:

```
    some indented text|
(exec this command)
    |some indented text
(exec again)
|    some indented text

    - some list item|
    - |some list item
|   - some list item

    - [ ] some task list item|
    - [ ] |some task list item
|   - [ ] some task list item

    1. some numbered list item|
    1. |some numbered list item
|   1. some numbered list item
```

- Unordered list line begins `- `, `* `, or `+ `.
- Task list line begins `- [ ] `, `* [ ] `, or `+ [ ] `.
- Ordered list line begins `1. ` or `1) `.

Refer to: https://help.obsidian.md/syntax#Lists

## command: Advanced (+ headings)

In addition to the above, different from the HOME key action, it also consider heading line.

```
## heading line|
(exec Advanced command)
## |heading line
(exec again)
|## heading line
```
- Heading begins `# ` to `###### `. (1 to 6)

Refer to: https://help.obsidian.md/syntax#Headings

# Usecase
## Mac
Simply bind the hotkey for this command to Control+A.
Please use either Normal or Advanced according to your preference.

## Windows
Used in combination with **[obsidian-emacs-text-editor](https://github.com/Klojer/obsidian-emacs-text-editor)**,
giving up on the OS standard select-all shortcut,
bind the hotkey to this command instead of `begining-of-line` to Ctrl+A.

## How to install
```
$ npm install
$ npm run dev
```
