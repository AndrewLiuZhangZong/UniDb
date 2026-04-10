import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { startServer } from '../server/index'
import { getDriverManager } from '../server/drivers/DriverManager'

let mainWindow: BrowserWindow | null = null
let serverPort: number = 3000
// macOS Dock 图标路径（在函数外部定义，确保在 app.whenReady 中可用）
const dockIconPath = process.platform === 'darwin'
  ? join(__dirname, '../resources/icon.png')  // 使用 png 格式作为 Dock 图标
  : ''

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

const createWindow = () => {
  // macOS 窗口图标使用 png 格式
  const pngIconPath = join(__dirname, '../resources/icon.png')

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false, // 完全自定义标题栏
    icon: pngIconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false,
    title: 'UniDb',
    // macOS 圆角窗口
    ...(process.platform === 'darwin' ? {
      roundedCorners: true
    } : {})
  })

  mainWindow.loadURL(VITE_DEV_SERVER_URL)
  mainWindow.webContents.openDevTools()

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 监听窗口最大化状态变化
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-change', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-change', false)
  })

  // 监听全屏状态变化
  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('window-fullscreen-change', true)
  })

  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('window-fullscreen-change', false)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    serverPort = await startServer()
    console.log(`Backend server started on port ${serverPort}`)
  } catch (error) {
    console.error('Failed to start backend server:', error)
  }

  const driverManager = getDriverManager()
  console.log(`Driver manager initialized at: ${driverManager.getDriverDirectory()}`)

  createWindow()

  if (process.platform === 'darwin') {
    app.dock.setIcon(dockIconPath)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('get-server-port', () => {
  return serverPort
})

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-unmaximize', () => {
  mainWindow?.unmaximize()
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false
})

ipcMain.on('window-toggle-fullscreen', () => {
  if (mainWindow) {
    const isFullscreen = mainWindow.isFullScreen()
    mainWindow.setFullScreen(!isFullscreen)
  }
})

ipcMain.handle('window-is-fullscreen', () => {
  return mainWindow?.isFullScreen() ?? false
})
