[
  {
    "key": "alt+/",
    "command": "editor.action.triggerSuggest",
    "when": "editorHasCompletionItemProvider && textInputFocus && !editorReadonly"
  },
  {
    "key": "alt+/",
    "command": "extension.vim_ctrl+space",
    "when": "editorTextFocus && vim.active && vim.use<C-space> && !inDebugRepl && vim.mode != 'Insert'"
  },
  {
    "key": "alt+/",
    "command": "toggleSuggestionDetails",
    "when": "suggestWidgetVisible && textInputFocus"
  },
  {
    "key": "ctrl+l",
    "command": "-expandLineSelection",
    "when": "textInputFocus"
  },
  {
    "key": "ctrl+e",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+alt+f",
    "command": "actions.find",
    "when": "editorFocus || editorIsOpen"
  },
  {
    "key": "ctrl+f",
    "command": "-actions.find",
    "when": "editorFocus || editorIsOpen"
  },
  {
    "key": "ctrl+alt+f",
    "command": "workbench.action.terminal.focusFind",
    "when": "terminalFindFocused && terminalHasBeenCreated || terminalFindFocused && terminalProcessSupported || terminalFocusInAny && terminalHasBeenCreated || terminalFocusInAny && terminalProcessSupported"
  },
  {
    "key": "ctrl+f",
    "command": "-workbench.action.terminal.focusFind",
    "when": "terminalFindFocused && terminalHasBeenCreated || terminalFindFocused && terminalProcessSupported || terminalFocusInAny && terminalHasBeenCreated || terminalFocusInAny && terminalProcessSupported"
  },
  {
    "key": "ctrl+\\",
    "command": "-workbench.action.splitEditor"
  },
  {
    "key": "ctrl+p",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+alt+p",
    "command": "workbench.action.quickOpen"
  },
  {
    "key": "ctrl+k",
    "command": "deleteAllRight",
    "when": "terminalFocus"
  },
  {
    "key": "ctrl+shift+v",
    "command": "-markdown.showPreview",
    "when": "!notebookEditorFocused && editorLangId == 'markdown'"
  },
  {
    "key": "ctrl+q",
    "command": "-workbench.action.quickOpenView"
  },
  {
    "key": "ctrl+q",
    "command": "-workbench.action.quickOpenNavigateNextInViewPicker",
    "when": "inQuickOpen && inViewsPicker"
  },
  {
    "key": "ctrl+/",
    "command": "-workbench.action.terminal.sendSequence",
    "when": "terminalFocus"
  },
  {
    "key": "ctrl+/",
    "command": "-editor.action.commentLine",
    "when": "editorTextFocus && !editorReadonly"
  },
  {
    "key": "ctrl+/",
    "command": "-terminalSuggestToggleExplainMode",
    "when": "terminalFocus && terminalHasBeenCreated && terminalIsOpen && terminalSuggestWidgetVisible || terminalFocus && terminalIsOpen && terminalProcessSupported && terminalSuggestWidgetVisible"
  },
  {
    "key": "ctrl+/",
    "command": "workbench.action.terminal.toggleTerminal",
    "when": "terminal.active"
  },
  {
    "key": "ctrl+alt+i",
    "command": "aichat.newchataction"
  },
  {
    "key": "ctrl+l",
    "command": "-aichat.newchataction"
  }
]
