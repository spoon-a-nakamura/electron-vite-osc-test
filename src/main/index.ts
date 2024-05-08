/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, app, globalShortcut, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import * as HU from './HokuyoUtils'

// アプリケーションのパス確認
console.log(app.getAppPath())

const md = new HU.UST10LX.MD({ fov: 90, skips: 1 })
// const md = new HU.UST10LX.MD()
const tcp = new HU.TCP('192.168.5.10', 10940)
const coordConverter = new HU.CoordinateConverter('bottom-right', [0.605, -0.43], [1, 0.7])

// ウィンドウを作成する関数
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    tcp.connect(() => {
      console.log('✨ Sensor Connected')
      tcp.send(md.command.request)
    })

    tcp.listen((rawData) => {
      // const distances = md.getDistancesFromBuffer(rawData)
      // console.log('-------------------')
      // console.log(md.getResponseTime())
      // console.log(distances)
      // // console.log(md.decodeBuffer(rawData))
      // mainWindow.webContents.send('response-data', distances)

      console.log('-------------------')
      const coord = md.getCoordinatesFromBuffer(coordConverter, rawData)
      console.log(coord)
      mainWindow.webContents.send('response-data', coord)
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
    tcp.disconnect(md.command.quit)
  })

  return mainWindow
}

// アプリケーションの準備ができたらウィンドウを作成する
app.whenReady().then(() => {
  const mainWindow = createWindow()

  // ----------------------
  // add globalShortcut
  // ----------------------
  globalShortcut.register('F5', () => {
    mainWindow.reload()
  })
  globalShortcut.register('CommandOrControl+F12', () => {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools()
    } else {
      mainWindow.webContents.openDevTools()
    }
  })
  globalShortcut.register('F9', () => {
    mainWindow.setMenuBarVisibility(!mainWindow.isMenuBarVisible())
  })
})

// 全ウィンドウが閉じられたらプロセスを閉じる
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
