/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as net from 'net'
import * as OSC from 'node-osc'
import { MD } from './HokuyoUtils/MD'

const md = new MD({ fov: 90 })

const oscClient = new OSC.Client('127.0.0.1', 57121)
// アプリケーションのパス確認
console.log(app.getAppPath())

// センサークライアントを作成する関数
function createSensorClient() {
  const client = new net.Socket()
  const sensorIP = '192.168.5.10'
  const port = 10940

  client.connect({ port: port, host: sensorIP }, () => {
    console.log('✨ Sensor Connected')
    client.write(md.commnad)
  })

  // センサーからデータを受信した時の処理
  client.on('data', (rawData) => {
    const distances = md.getDistancesFromBuffer(rawData)

    console.log('-------------------')
    console.log(md.timestamp)
    console.log(distances.length)
    // console.log(distances)
  })

  client.on('close', () => {
    console.log('Connection closed')
  })

  client.on('error', (err) => {
    console.error('Connection error:', err)
  })

  return client
}

// OSCメッセージ送信の関数
function sendOscMessage(address: string, ...args: OSC.ArgumentType[]) {
  const oscMessage = new OSC.Message(address, ...args)
  oscClient.send(oscMessage)
}

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
  const sensorClient = createSensorClient()

  mainWindow.on('closed', () => {
    sensorClient.destroy() // センサークライアントの破棄
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
