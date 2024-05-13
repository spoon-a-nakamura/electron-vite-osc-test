import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: {
      response: (callback) => void
      visibledMarkerView: (callback) => void
      visibledSketchView: (callback) => void
    }
  }
}
