export {}

declare global {
  interface Window {
    electronAPI?: {
      getServerPort: () => Promise<number>
      platform: string
      versions: {
        node: string
        chrome: string
        electron: string
      }
      minimize?: () => void
      maximize?: () => void
      unmaximize?: () => void
      close?: () => void
      toggleFullscreen?: () => void
      onMenuAction?: (callback: (action: string) => void) => void
    }
  }
}
