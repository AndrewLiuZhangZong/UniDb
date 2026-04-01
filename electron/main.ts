import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { startServer } from '../server/index'
import { getDriverManager } from '../server/drivers/DriverManager'

let mainWindow: BrowserWindow | null = null
let serverPort: number = 3000

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

const createWindow = () => {
  // Determine if we should use native frame
  const isMac = process.platform === 'darwin'

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: true, // Use native frame on all platforms for proper macOS traffic lights
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false,
    title: 'UniDb'
  })

  // In development, always load from Vite dev server
  mainWindow.loadURL(VITE_DEV_SERVER_URL)
  mainWindow.webContents.openDevTools()

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
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

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false
})
