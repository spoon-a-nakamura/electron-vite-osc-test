/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, app, globalShortcut, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import * as HU from './HokuyoUtils'
import { AppConfig, readAppConfig } from './config'

class App {
  private readonly cnf: AppConfig
  private readonly tcp: HU.TCP
  private readonly md: HU.UST10LX.MD
  private readonly coordConverter: HU.CoordinateConverter

  constructor() {
    console.log(app.getAppPath())

    this.cnf = readAppConfig(join(app.getAppPath(), 'appconfig.ini'))

    this.tcp = new HU.TCP(this.cnf.sensor._1.ip, this.cnf.sensor._1.port)
    this.md = new HU.UST10LX.MD({ ...this.cnf.sensor })
    this.coordConverter = this.createCoordinateConverter()

    app.whenReady().then(() => {
      const win = this.createWindow()
      this.addWindowEvents(win)
      this.addGlobalShortcuts(win)
      this.addMenuItems(win)
    })

    this.addAppEvents()
  }

  private createCoordinateConverter() {
    return new HU.CoordinateConverter({
      sensorPlacement: this.cnf.sensor._1.placement,
      sensorCoordinateFromCenter: this.cnf.sensor._1.coordinate_from_center,
      projectionAreaSize: this.cnf.projection.screen_size,
      ...this.cnf.coordinate_converter,
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
      width: this.cnf.app.window_size[0],
      height: this.cnf.app.window_size[1],
      show: false,
      autoHideMenuBar: this.cnf.app.auto_hide_menubar,
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

    new Promise(async (resolve) => {
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        await win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${this.cnf.app.renderer_file}`)
      } else {
        await win.loadFile(join(__dirname, `../renderer/${this.cnf.app.renderer_file}`))
      }
      resolve(null)
    }).then(() => {
      this.initRenderer(win)
    })

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
            checked: this.cnf.app.visibled_marker,
            click: (e) => win.webContents.send('marker-view', e.checked),
          },
          {
            label: 'sketch view',
            type: 'checkbox',
            checked: this.cnf.app.visibled_sketch,
            click: (e) => win.webContents.send('sketch-view', e.checked),
          },
        ],
      },
    ]

    const defMenuItems = Menu.getApplicationMenu()?.items
    if (defMenuItems) items.unshift(...defMenuItems)

    const menu = Menu.buildFromTemplate(items)
    Menu.setApplicationMenu(menu)
  }

  private initRenderer(win: BrowserWindow) {
    win.webContents.send('marker-view', this.cnf.app.visibled_marker)
    win.webContents.send('sketch-view', this.cnf.app.visibled_sketch)
  }
}

new App()
