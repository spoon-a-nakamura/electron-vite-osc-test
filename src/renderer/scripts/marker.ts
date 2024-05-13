import { datas } from './datas'

class Marker {
  private markerEl: HTMLElement
  private logCoords: HTMLElement
  private logFPS: HTMLElement
  private sensorDotsContainer: HTMLElement
  private sensorDots: NodeListOf<HTMLElement>
  private animeId?: number
  private prevTime = performance.now()
  private fpsLogs: number[] = []

  constructor() {
    this.createMarkerView()

    this.markerEl = document.querySelector<HTMLElement>('.marker')!
    this.logCoords = this.markerEl.querySelector<HTMLElement>('.logs > .coords')!
    this.logFPS = this.markerEl.querySelector<HTMLElement>('.logs > .fps > .num')!
    this.sensorDotsContainer = this.markerEl.querySelector<HTMLElement>('.sensor-dots')!

    this.sensorDots = this.createSensorDots(100)
  }

  private createMarkerView() {
    document.body.innerHTML = `
      ${document.body.innerHTML}

      <div class="marker hidden">
        <div class="rulers">
          <div class="vertical-lines">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="horizontal-lines">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="axis">
            <span class="x"></span>
            <span class="y"></span>
            <span class="center"></span>
          </div>
        </div>

        <div class="sensor-dots"></div>

        <div class="logs">
          <p class="fps"><span>FPS: </span><span class="num">75</span></p>
          <p class="coords">[coordinates]</p>
        </div>
      </div>
    `
  }

  private createSensorDots(count: number) {
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span')
      dot.classList.add('hidden')
      this.sensorDotsContainer.appendChild(dot)
    }
    return this.sensorDotsContainer.querySelectorAll<HTMLElement>('span')
  }

  visible() {
    this.markerEl.classList.toggle('hidden', false)
    this.animeId = this.update()
  }

  hidden() {
    this.markerEl.classList.toggle('hidden', true)
    this.fpsLogs.length = 0
    this.prevTime = 0
  }

  private get isHidden() {
    return this.markerEl.classList.contains('hidden')
  }

  private fixed(num: number, precision = 3) {
    return num.toFixed(precision)
  }

  private updateFps() {
    const currentTime = performance.now()
    const dt = currentTime - this.prevTime
    this.prevTime = currentTime
    if (0 < dt) {
      this.fpsLogs.push(1000 / dt)
      if (20 < this.fpsLogs.length) this.fpsLogs.shift()
      const avgFps = this.fpsLogs.reduce((p, c) => p + c) / this.fpsLogs.length
      this.logFPS.innerText = avgFps.toFixed(0)
    }
  }

  private update() {
    if (this.isHidden) {
      this.animeId && cancelAnimationFrame(this.animeId)
      return
    }
    const id = requestAnimationFrame(this.update.bind(this))

    // update fps log
    this.updateFps()

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
