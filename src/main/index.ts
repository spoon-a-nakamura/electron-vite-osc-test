/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as HU from './HokuyoUtils'

// アプリケーションのパス確認
console.log(app.getAppPath())

const md = new HU.UST10LX.MD({ fov: 90 })
// const md = new HU.MD()
// const md = new HU.MD({ start: 539, end: 541 })
const tcp = new HU.TCP('192.168.5.10', 10940)

// ウィンドウを作成する関数
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    tcp.connect(() => {
      console.log('✨ Sensor Connected')
      tcp.send(md.command)
    })

    tcp.listen((rawData) => {
      const distances = md.getDistancesFromBuffer(rawData)

      console.log('-------------------')
      // console.log(md.timestamp)
      // console.log(distances.length)
      console.log(distances)
    })
  })

  // 外部ウィンドウのリンクを許可しない設定
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 開発用のURLを読み込むか、本番用のファイルを読み込む（このprocess.envは.envファイルで定義する、、？）
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    tcp.disconnect(md.commandQuit)
  })
}

// アプリケーションの準備ができたらウィンドウを作成する
app.whenReady().then(() => {
  createWindow()
})

// 全ウィンドウが閉じられたらプロセスを閉じる
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// レンダラーに送りたいが、ここもよく分からない
ipcMain.on('requestData', (event) => {
  event.sender.send('responseData', { data: 'hogehoge' })
})
