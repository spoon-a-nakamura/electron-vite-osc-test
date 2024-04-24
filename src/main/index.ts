/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as net from 'net'
import * as OSC from 'node-osc'

const oscClient = new OSC.Client('127.0.0.1', 57121)

// アプリケーションのパス確認
console.log(app.getAppPath())

// OSCメッセージ送信の関数
function sendOscMessage(address: string, ...args: OSC.ArgumentType[]) {
  const oscMessage = new OSC.Message(address, ...args)
  oscClient.send(oscMessage)
}

// センサーデータのデコードトライ
function decodeSensorData(encodedString: string): number {
  // const characters = encodedString.split('')
  // const decodedValues = characters.map((char) => char.charCodeAt(0) - 0x30)
  // const binaryString = decodedValues.map((val) => val.toString(2).padStart(6, '0')).join('')
  // return parseInt(binaryString, 2)
  console.log(encodedString)
  return 1
}

// センサークライアントを作成する関数
function createSensorClient() {
  const client = new net.Socket()
  const sensorIP = '192.168.5.10'
  const port = 10940

  client.connect({ port: port, host: sensorIP }, () => {
    console.log('Sensor Connected')
    // センサーにデータ取得要求を送信（Wiki: https://sourceforge.net/p/urgnetwork/wiki/scip_capture_jp/ ）
    // client.write('MD0044072501000\n') // MD
    client.write('GD0044072501\n') // GD
  })

  // センサーからデータを受信した時の処理
  client.on('data', (data) => {
    console.log(data)
    sendOscMessage('/sensor/distance', data)
  })

  client.on('close', () => {
    console.log('Connection closed')
  })

  client.on('error', (err) => {
    console.error('Connection error:', err)
  })

  return client
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
