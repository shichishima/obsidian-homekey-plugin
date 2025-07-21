# HOME key action (begining-of-text) for Obsidian

This plugin provides a command that acts like the HOME key.
(On Mac, action like Command+Left not Control+A)

Execute this command on the line of indent or list text,
the cursor will move to the beginning of the indented text
instead of the left edge of the line.

On the other hand, Control-A always moves the cursor to the left edge of the line.

## command: Normal (consider indents / lists / tasklists)

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

Unordered list line begins `- `, `* `, or `+ `.
Task list line begins `- [ ] `, `* [ ] `, or `+ [ ] `.
Ordered list line begins `1. ` or `1) `.

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
Heading begins `# ` to `###### `. (1 to 6)

Refer to: https://help.obsidian.md/syntax#Headings

# Usecase
## Mac
Simply bind the hotkey for this command to Control-A.
Please use either Normal or Advanced according to your preference.

## Windows
Giving up on the OS standard select-all shortcut,
bind the hotkey for this command to Ctrl-A.
Used in combination with **[obsidian-emacs-text-editor](https://github.com/Klojer/obsidian-emacs-text-editor)**,
instead of command `begining-of-line`.


## How to install
```
$ npm install
$ npm run dev
```
