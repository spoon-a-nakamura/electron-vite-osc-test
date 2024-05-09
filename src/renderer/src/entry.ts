console.log('entry render process')

const debugLogsTextEl = document.querySelector<HTMLParagraphElement>('.logs p')
const sensorDots = document.querySelectorAll<HTMLElement>('.sensor-dots > span')!

function fixed(num: number, precision = 3) {
  return num.toFixed(precision)
}

window.electronAPI.response((coords: [number, number][]) => {
  if (debugLogsTextEl) {
    let str = ''
    for (const coord of coords) {
      str += fixed(coord[0]) + ', ' + fixed(coord[1]) + '\n'
    }
    debugLogsTextEl.innerText = str
  }

  if (sensorDots.length < coords.length) {
    for (let i = 0; i < coords.length; i++) {
      if (i < sensorDots.length) {
        const dot = sensorDots[i]
        dot.style.setProperty('--x', fixed(coords[i][0]))
        dot.style.setProperty('--y', fixed(coords[i][1]))
      }
    }
  } else {
    for (let i = 0; i < sensorDots.length; i++) {
      const dot = sensorDots[i]
      if (i < coords.length) {
        dot.style.setProperty('--x', fixed(coords[i][0]))
        dot.style.setProperty('--y', fixed(coords[i][1]))
      } else {
        dot.style.setProperty('--x', '0')
        dot.style.setProperty('--y', '0')
      }
    }
  }
})
