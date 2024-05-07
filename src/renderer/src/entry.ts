console.log('entry render process')

const debugLogsTextEl = document.querySelector<HTMLParagraphElement>('.logs p')

window.electronAPI.response((value) => {
  if (debugLogsTextEl) {
    debugLogsTextEl.innerText = value
  }
})
