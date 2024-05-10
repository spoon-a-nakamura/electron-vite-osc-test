/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, app, globalShortcut, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import * as HU from './HokuyoUtils'

// アプリケーションのパス確認
console.log(app.getAppPath())

const tcp = new HU.TCP('192.168.5.10', 10940)

const md = new HU.UST10LX.MD({ fov: 90 })

const coordConverter = new HU.CoordinateConverter({
  sensorPlacement: 'bottom-right',
  sensorCoordinateFromCenter: [0.635, -0.368],
  projectionAreaSize: [1, 0.7],
  normalize: true,
  bunch: true,
  bunchEps: 0.05,
  bunchPrecisionCount: 3,
})

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
      const coord = md.getCoordinates(coordConverter, rawData)
      mainWindow.webContents.send('response-data', coord)

      // console.log('-------------------')
      // console.log(coord)
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

  // add menu items
  let items: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: 'Options',
      submenu: [
        {
          label: 'toggle marker',
        },
        {
          label: 'toggle sketch',
        },
      ],
    },
  ]

  const defMenuItems = Menu.getApplicationMenu()?.items
  if (defMenuItems) items.unshift(...defMenuItems)

  const menu = Menu.buildFromTemplate(items)
  Menu.setApplicationMenu(menu)

  // add globalShortcut
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
