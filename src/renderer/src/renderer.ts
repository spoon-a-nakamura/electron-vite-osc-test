import { ipcRenderer } from 'electron'

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing()
  })
}

function doAThing(): void {
  const versions = window.electron.process.versions
  replaceText('.electron-version', `Electron v${versions.electron}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  replaceText('.node-version', `Node v${versions.node}`)

  // IPCハンドラーボタンがクリックされた時の処理
  const ipcHandlerBtn = document.getElementById('ipcHandler')
  ipcHandlerBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('ping') // IPCメッセージ 'ping' を送信（特に反応が見られないが、、、）
  })
}

// doAThing()で使われている関数
function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

// IPCメッセージ 'responseData' を受信した時の処理はこう書ける、、、？
const dataDisplay = document.querySelector('.data_display')
ipcRenderer.on('responseData', (_, args) => {
  console.log('Received data via IPC:', args.data)
  if (dataDisplay) {
    dataDisplay.textContent = `Received: ${args.data}`
  }
})

init()
