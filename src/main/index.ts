/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, app, globalShortcut, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import * as HU from './HokuyoUtils'
// import fs from 'fs'

class App {
  private readonly tcp: HU.TCP
  private readonly md: HU.UST10LX.MD
  private readonly coordConverter: HU.CoordinateConverter

  constructor() {
    this.tcp = new HU.TCP('192.168.5.10', 10940)
    this.md = new HU.UST10LX.MD({ fov: 90 })
    this.coordConverter = this.createCoordinateConverter()

    console.log(app.getAppPath())

    app.whenReady().then(() => {
      const win = this.createWindow()
      this.addWindowEvents(win)
      this.addGlobalShortcuts(win)
      this.addMenuItems(win)
    })

    this.addAppEvents()

    // const buffer = fs.readFileSync(join(app.getAppPath(), 'README.md'))
    // const data = buffer.toString('utf8')
    // console.log(data)
  }

  private createCoordinateConverter() {
    return new HU.CoordinateConverter({
      sensorPlacement: 'bottom-right',
      sensorCoordinateFromCenter: [0.635, -0.368],
      projectionAreaSize: [1, 0.7],
      normalize: true,
      bunch: true,
      bunchEps: 0.05,
      bunchPrecisionCount: 3,
    })
  }

  private addAppEvents() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  private createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 700,
      show: false,
      // autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
      },
    })

    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return win
  }

  private addWindowEvents(win: BrowserWindow) {
    const { tcp, md, coordConverter } = this

    win.on('ready-to-show', () => {
      win.show()

      tcp.connect(() => {
        console.log('✨ Sensor Connected')
        tcp.send(md.command.request)
      })

      tcp.listen((rawData) => {
        const coord = md.getCoordinates(coordConverter, rawData)
        win.webContents.send('response-data', coord)

        // console.log('-------------------')
        // console.log(coord)
      })
    })

    win.on('closed', () => {
      tcp.disconnect(md.command.quit)
    })
  }

  private addGlobalShortcuts(win: BrowserWindow) {
    globalShortcut.register('F5', () => win.reload())

    globalShortcut.register('F9', () => win.setMenuBarVisibility(!win.isMenuBarVisible()))

    globalShortcut.register('CommandOrControl+F12', () => {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools()
      } else {
        win.webContents.openDevTools()
      }
    })
  }

  private addMenuItems(win: BrowserWindow) {
    const items: (MenuItemConstructorOptions | MenuItem)[] = [
      {
        label: 'Options',
        submenu: [
          {
            label: 'marker view',
            type: 'checkbox',
            checked: true,
            click: (e) => win.webContents.send('marker-view', e.checked),
          },
          {
            label: 'sketch view',
            type: 'checkbox',
            checked: true,
            click: (e) => win.webContents.send('sketch-view', e.checked),
          },
          {
            type: 'separator',
          },
        ],
      },
    ]

    const defMenuItems = Menu.getApplicationMenu()?.items
    if (defMenuItems) items.unshift(...defMenuItems)

    const menu = Menu.buildFromTemplate(items)
    Menu.setApplicationMenu(menu)
  }
}

new App()
