import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { startServer } from '../server/index'
import { getDriverManager } from '../server/drivers/DriverManager'

let mainWindow: BrowserWindow | null = null
let serverPort: number = 3000

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false, // 使用自定义标题栏
    titleBarStyle: 'hidden', // macOS 上隐藏标题栏但保留 Traffic Lights
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false,
    title: 'UniDb'
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
