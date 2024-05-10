import { datas } from './datas'

class Marker {
  private markerEl = document.querySelector<HTMLElement>('.marker')!
  private logCoords = this.markerEl.querySelector<HTMLElement>('.logs > .coords')!
  private logFPS = this.markerEl.querySelector<HTMLElement>('.logs > .fps > .num')!
  private sensorDotsContainer = this.markerEl.querySelector<HTMLElement>('.sensor-dots')!
  private sensorDots: NodeListOf<HTMLElement>
  private animeId?: number
  private prevTime = performance.now()
  private fpsLogs: number[] = []

  constructor() {
    this.sensorDots = this.createSensorDots(100)
  }

  private createSensorDots(count: number) {
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span')
      dot.classList.add('hidden')
      this.sensorDotsContainer.appendChild(dot)
    }
    return this.sensorDotsContainer.querySelectorAll<HTMLElement>('span')
  }

  show() {
    this.markerEl.classList.toggle('hidden', false)
    this.animeId = this.update()
  }

  hidden() {
    this.markerEl.classList.toggle('hidden', true)
    this.animeId && cancelAnimationFrame(this.animeId)
  }

  private fixed(num: number, precision = 3) {
    return num.toFixed(precision)
  }

  private update() {
    const id = requestAnimationFrame(this.update.bind(this))

    // update fps log
    const currentTime = performance.now()
    const dt = currentTime - this.prevTime
    this.prevTime = currentTime
    this.fpsLogs.push(1000 / dt)
    if (20 < this.fpsLogs.length) this.fpsLogs.shift()
    const avgFps = this.fpsLogs.reduce((p, c) => p + c) / this.fpsLogs.length
    this.logFPS.innerText = avgFps.toFixed(0)

    const coords = datas.coordinates
    if (!coords) return id

    // update coordinates log
    let str = ''
    for (const coord of coords) {
      str += this.fixed(coord[0]) + ', ' + this.fixed(coord[1]) + '\n'
    }
    this.logCoords.innerText = str

    // update markers
    for (let i = 0; i < this.sensorDots.length; i++) {
      const dot = this.sensorDots[i]
      if (i < coords.length) {
        dot.classList.remove('hidden')
        dot.style.setProperty('--x', this.fixed(coords[i][0]))
        dot.style.setProperty('--y', this.fixed(coords[i][1]))
      } else {
        dot.classList.add('hidden')
      }
    }

    return id
  }
}

export const marker = new Marker()
