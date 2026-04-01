/**
 * macOS Native Menu Builder
 * Creates native application menu for macOS
 */

import { Menu, MenuItemConstructorOptions, app, shell, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'

interface MenuCallbacks {
  onNewConnection: () => void
  onOpenConnection: () => void
  onNewQuery: () => void
  onNewTab: () => void
  onExport: () => void
  onImport: () => void
  onExit: () => void
  onExecute: () => void
  onFormatSQL: () => void
  onOpenConsole: () => void
  onRefresh: () => void
  onRefreshMetadata: () => void
  onCreateTable: () => void
  onCreateDatabase: () => void
  onCreateIndex: () => void
  onManageConnections: () => void
  onSettings: () => void
  onViewLogs: () => void
  onDocumentation: () => void
  onKeyboardShortcuts: () => void
  onReportBug: () => void
  onAbout: () => void
}

let callbacks: MenuCallbacks | null = null

export function setMenuCallbacks(cb: MenuCallbacks) {
  callbacks = cb
}

export function buildMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    // App Menu (UniDb)
    {
      label: 'UniDb',
      submenu: [
        {
          label: 'About UniDb',
          click: () => callbacks?.onAbout?.()
        },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'Cmd+,',
          click: () => callbacks?.onSettings?.()
        },
        { type: 'separator' },
        {
          label: 'Hide UniDb',
          accelerator: 'Cmd+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Cmd+Shift+H',
          role: 'hideOtherApps'
        },
        {
          label: 'Show All',
          role: 'unhideAllApps'
        },
        { type: 'separator' },
        {
          label: 'Quit UniDb',
          accelerator: 'Cmd+Q',
          role: 'quit'
        }
      ]
    },

    // File Menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Connection',
          accelerator: 'Cmd+N',
          click: () => callbacks?.onNewConnection?.()
        },
        {
          label: 'Open Connection',
          accelerator: 'Cmd+O',
          click: () => callbacks?.onOpenConnection?.()
        },
        { type: 'separator' },
        {
          label: 'New Query Tab',
          accelerator: 'Cmd+T',
          click: () => callbacks?.onNewTab?.()
        },
        {
          label: 'New Query',
          accelerator: 'Cmd+Shift+T',
          click: () => callbacks?.onNewQuery?.()
        },
        { type: 'separator' },
        {
          label: 'Export...',
          accelerator: 'Cmd+E',
          click: () => callbacks?.onExport?.()
        },
        {
          label: 'Import...',
          accelerator: 'Cmd+I',
          click: () => callbacks?.onImport?.()
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          accelerator: 'Cmd+W',
          role: 'close'
        },
        {
          label: 'Exit',
          accelerator: 'Cmd+Q',
          click: () => callbacks?.onExit?.()
        }
      ]
    },

    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Cmd+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Cmd+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Cmd+X', role: 'cut' },
        { label: 'Copy', accelerator: 'Cmd+C', role: 'copy' },
        { label: 'Paste', accelerator: 'Cmd+V', role: 'paste' },
        { type: 'separator' },
        { label: 'Select All', accelerator: 'Cmd+A', role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find...',
          accelerator: 'Cmd+F',
          role: 'find'
        },
        {
          label: 'Replace...',
          accelerator: 'Cmd+Option+F',
          role: 'replace'
        }
      ]
    },

    // View Menu
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Cmd+R',
          role: 'reload'
        },
        {
          label: 'Force Reload',
          accelerator: 'Cmd+Shift+R',
          role: 'forceReload'
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Option+Cmd+I',
          role: 'toggleDevTools'
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'Cmd+0',
          role: 'resetZoom'
        },
        {
          label: 'Zoom In',
          accelerator: 'Cmd+=',
          role: 'zoomIn'
        },
        {
          label: 'Zoom Out',
          accelerator: 'Cmd+-',
          role: 'zoomOut'
        },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Cmd+F',
          role: 'togglefullscreen'
        }
      ]
    },

    // SQL Menu
    {
      label: 'SQL',
      submenu: [
        {
          label: 'Execute Query',
          accelerator: 'Cmd+Enter',
          click: () => callbacks?.onExecute?.()
        },
        {
          label: 'Execute Current Line',
          accelerator: 'Cmd+L',
          click: () => callbacks?.onExecute?.()
        },
        {
          label: 'Execute Selection',
          accelerator: 'Cmd+Shift+Enter',
          click: () => callbacks?.onExecute?.()
        },
        { type: 'separator' },
        {
          label: 'Format SQL',
          accelerator: 'Cmd+Shift+F',
          click: () => callbacks?.onFormatSQL?.()
        },
        {
          label: 'Beautify',
          accelerator: 'Cmd+B',
          click: () => callbacks?.onFormatSQL?.()
        },
        { type: 'separator' },
        {
          label: 'Open SQL Console',
          accelerator: 'Cmd+`',
          click: () => callbacks?.onOpenConsole?.()
        }
      ]
    },

    // Database Menu
    {
      label: 'Database',
      submenu: [
        {
          label: 'Connect',
          accelerator: 'Cmd+D',
          click: () => callbacks?.onRefresh?.()
        },
        {
          label: 'Disconnect',
          accelerator: 'Cmd+Shift+D',
          click: () => callbacks?.onRefresh?.()
        },
        { type: 'separator' },
        {
          label: 'Refresh',
          accelerator: 'F5',
          click: () => callbacks?.onRefresh?.()
        },
        {
          label: 'Refresh Metadata',
          accelerator: 'Cmd+F5',
          click: () => callbacks?.onRefreshMetadata?.()
        },
        { type: 'separator' },
        {
          label: 'Create Table...',
          accelerator: 'Cmd+Shift+C',
          click: () => callbacks?.onCreateTable?.()
        },
        {
          label: 'Create Database...',
          click: () => callbacks?.onCreateDatabase?.()
        },
        {
          label: 'Create Index...',
          click: () => callbacks?.onCreateIndex?.()
        },
        { type: 'separator' },
        {
          label: 'Manage Connections...',
          click: () => callbacks?.onManageConnections?.()
        }
      ]
    },

    // Window Menu
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Cmd+M',
          role: 'minimize'
        },
        {
          label: 'Zoom',
          role: 'zoom'
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    },

    // Help Menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => callbacks?.onDocumentation?.()
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'Cmd+/',
          click: () => callbacks?.onKeyboardShortcuts?.()
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => callbacks?.onReportBug?.()
        },
        { type: 'separator' },
        {
          label: 'View Logs',
          click: () => callbacks?.onViewLogs?.()
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => callbacks?.onAbout?.()
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}

export function setupMacOSMenu(callbacks: MenuCallbacks) {
  setMenuCallbacks(callbacks)

  // Set the application menu
  const menu = buildMenu()
  Menu.setApplicationMenu(menu)

  return menu
}
