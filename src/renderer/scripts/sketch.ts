class Sketch {
  private readonly sketchEl = document.querySelector<HTMLElement>('.sketch')!
  visibleCallback?: () => void
  hiddenCallback?: () => void

  constructor() {
    this.addEvents()
  }

  private addEvents() {
    window.electronAPI.visibledSketchView((visibled) => {
      if (visibled) this.visible()
      else this.hidden()
    })
  }

  visible() {
    this.sketchEl.classList.remove('hidden')
    this.visibleCallback?.()
  }

  hidden() {
    this.sketchEl.classList.add('hidden')
    this.hiddenCallback?.()
  }
}

export const sketch = new Sketch()
