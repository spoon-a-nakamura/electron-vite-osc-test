import { Canvas } from './webgl/Canvas'

class Sketch {
  private readonly sketchEl = document.querySelector<HTMLElement>('.sketch')!
  private canvas?: Canvas

  constructor() {
    this.canvas = this.createCanvas()
  }

  private createCanvas() {
    const canvas = this.sketchEl.querySelector<HTMLCanvasElement>('canvas')
    if (canvas) return new Canvas(canvas)
    return
  }

  show() {
    this.sketchEl.classList.remove('hidden')
    this.canvas?.startRendering()
  }

  hidden() {
    this.sketchEl.classList.add('hidden')
    this.canvas?.stopRendering()
  }
}

export const sketch = new Sketch()
