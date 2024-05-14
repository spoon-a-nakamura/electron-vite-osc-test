export class Fps {
  private prevTime = performance.now()
  private logs: number[] = []

  constructor(private loggingCount = 20) {}

  update() {
    const currentTime = performance.now()
    const dt = currentTime - this.prevTime
    this.prevTime = currentTime
    let fps = 0
    if (0 < dt) {
      this.logs.push(1000 / dt)
      if (this.loggingCount < this.logs.length) this.logs.shift()
      fps = this.logs.reduce((p, c) => p + c) / this.logs.length
    }
    return fps
  }

  clear() {
    this.prevTime = 0
    this.logs.length = 0
  }
}
