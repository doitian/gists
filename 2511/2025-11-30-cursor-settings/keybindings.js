[
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
    "key": "ctrl+p",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+alt+p",
    "command": "workbench.action.quickOpen"
  },
  {
    "key": "ctrl+l",
    "command": "-expandLineSelection",
    "when": "textInputFocus"
  },
  {
    "key": "ctrl+l",
    "command": "-aichat.newchataction"
  }
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
