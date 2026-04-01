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
    }
  }
}
