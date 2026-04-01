import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  // Menu actions
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, action: string) => callback(action)
    ipcRenderer.on('menu-action', handler)
    return () => ipcRenderer.removeListener('menu-action', handler)
  }
})

// Forward window state changes
ipcRenderer.on('window-maximized', (_, isMax: boolean) => {
  window.dispatchEvent(new CustomEvent('window-maximized-change', { detail: isMax }))
})

// Forward menu actions from main process
ipcRenderer.on('menu-action', (_, action: string) => {
  window.dispatchEvent(new CustomEvent('menu-action', { detail: action }))
})

export {}
