import { sensor } from './sensor'
import { Fps } from './utils/Fps'

class Marker {
  private markerEl: HTMLElement
  private logCoords: HTMLElement
  private logFPS: HTMLElement
  private sensorDotsContainer: HTMLElement
  private sensorDots: NodeListOf<HTMLElement>
  private animeId?: number
  private fps: Fps
  visibleCallback?: () => void
  hiddenCallback?: () => void

  constructor() {
    this.createMarkerView()

    this.markerEl = document.querySelector<HTMLElement>('.marker')!
    this.logCoords = this.markerEl.querySelector<HTMLElement>('.logs > .coords')!
    this.logFPS = this.markerEl.querySelector<HTMLElement>('.logs > .fps > .num')!
    this.sensorDotsContainer = this.markerEl.querySelector<HTMLElement>('.sensor-dots')!

    this.sensorDots = this.createSensorDots(100)

    this.addEvents()
    this.fps = new Fps()
  }

  private createMarkerView() {
    const main = document.querySelector<HTMLElement>('main')!
    main.innerHTML = `
      ${main.innerHTML}

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

  private addEvents() {
    window.electronAPI.visibledMarkerView((visibled) => {
      if (visibled) this.visible()
      else this.hidden()
    })
  }

  visible() {
    this.markerEl.classList.toggle('hidden', false)
    this.animeId = this.update()
    this.visibleCallback?.()
  }

  hidden() {
    this.markerEl.classList.toggle('hidden', true)
    this.fps.clear()
    this.hiddenCallback?.()
  }

  private get isHidden() {
    return this.markerEl.classList.contains('hidden')
  }

  private fixed(num: number, precision = 3) {
    return num.toFixed(precision)
  }

  private update() {
    if (this.isHidden) {
      this.animeId && cancelAnimationFrame(this.animeId)
      return
    }

    // update fps log
    this.logFPS.innerText = this.fps.update().toFixed(0)

    const coords = sensor.coords
    if (coords) {
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
    } else {
      for (const dot of this.sensorDots) {
        dot.classList.add('hidden')
      }
    }

    return requestAnimationFrame(this.update.bind(this))
  }
}

export const marker = new Marker()
