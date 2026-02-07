[
  {
    "key": "ctrl+shift+v",
    "command": "-markdown.showPreview",
    "when": "!notebookEditorFocused && editorLangId == 'markdown'"
  },
  {
    "key": "ctrl+shift+v",
    "command": "-planEditor.toggleMode",
    "when": "markdownPlanEditorActive"
  },
  {
    "key": "ctrl+shift+v",
    "command": "-markdownEditor.toggleMode",
    "when": "markdownEditorActive"
  },
  {
    "key": "ctrl+shift+v",
    "command": "-notebook.cell.pasteAbove",
    "when": "notebookEditorFocused && !inputFocus"
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
    "key": "ctrl+e",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+alt+p",
    "command": "workbench.action.quickOpen"
  },
  {
    "key": "ctrl+p",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+p",
    "command": "-expandLineSelection",
    "when": "textInputFocus"
  },
  {
    "key": "ctrl+l",
    "command": "-aichat.newchataction",
    "when": "activeEditor != 'workbench.editor.browserEditor'"
  },
  {
    "key": "ctrl+k",
    "command": "deleteAllRight",
    "when": "terminalFocus"
  },
  {
    "key": "ctrl+alt+i",
    "command": "aichat.newchataction"
  },
  {
    "key": "ctrl+alt+`",
    "command": "workbench.action.toggleMaximizedPanel"
  }
]
