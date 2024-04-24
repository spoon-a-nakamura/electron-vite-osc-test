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

// センサークライアントを作成する関数
function createSensorClient() {
  const client = new net.Socket()
  const decorder = new TextDecoder()
  const sensorIP = '192.168.5.10'
  const port = 10940

  client.connect({ port: port, host: sensorIP }, () => {
    console.log('✨ Sensor Connected')
    /**
     * センサーにデータ取得要求を送信（Wiki: https://sourceforge.net/p/urgnetwork/wiki/scip_capture_jp/ ）
     * 最初の４桁：距離データの取得開始インデックス
     * 次の４桁：距離データの取得終了インデックス
     * 次の２桁：距離データをまとめる取得データ数
     * 次の１桁：スキャンを何周期に１回行うか (MD, MS コマンドのみ)
     * 最後の２桁：データ取得回数 (MD, MS コマンドのみ)
     */
    const type = 'MD'
    const start = '0000'
    const end = '0001'
    const grouping = '00'
    const skips = '0'
    const scans = '00'
    client.write(`${type}${start}${end}${grouping}${skips}${scans}\n`)
  })

  // センサーからデータを受信した時の処理
  client.on('data', (rawData) => {
    const decodeBuffer = decorder.decode(rawData)
    const decodeBufferLines = decodeBuffer.split('\n').slice(3) // データを改行で分割し、最初の3行をスキップ
    const decodeSensorData = decodeBufferLines.map((decodeBufferLine) => {
      // console.log(decodeBufferLine)
      return decodeSensorData(decodeBufferLine, 3)
    })

    console.log(decodeSensorData)
    console.log('-------------------')

    // sendOscMessage('/sensor/distance', decodeSensorData)
  })

  client.on('close', () => {
    console.log('Connection closed')
  })

  client.on('error', (err) => {
    console.error('Connection error:', err)
  })

  return client
}

// センサーデータのデコード処理
function decodeSensorData(code: string, byte: number): number {
  let value = 0
  for (let i = 0; i < byte; ++i) {
    value <<= 6
    value &= ~0x3f
    value |= code.charCodeAt(i) - 0x30
  }
  return value
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
