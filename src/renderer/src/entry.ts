console.log('entry render process')

const debugLogsTextEl = document.querySelector<HTMLParagraphElement>('.logs p')
const sensorDots = document.querySelectorAll<HTMLElement>('.sensor-dots > span')!

window.electronAPI.response((value: [number, number][]) => {
  // if (debugLogsTextEl) {
  //   debugLogsTextEl.innerText = value.toString()
  // }

  for (let i = 0; i < value.length; i++) {
    if (i < sensorDots.length) {
      const dot = sensorDots[i]
      dot.style.setProperty('--x', (Math.random() * 2.0 - 1.0).toString())
      dot.style.setProperty('--y', (Math.random() * 2.0 - 1.0).toString())
    }
  }
})
