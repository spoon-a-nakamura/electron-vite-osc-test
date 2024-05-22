class Mouse {
  holdClick = false
  position: [number, number] = [0, 0]
  private prevPosition: [number, number] = [0, 0]

  constructor() {
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mousedown', this.handleMouseDown)
    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('mouseout', this.handleMouseUp)
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.prevPosition = [...this.position]
    const nX = (e.clientX / window.innerWidth) * 2.0 - 1.0
    const nY = (1.0 - e.clientY / window.innerHeight) * 2.0 - 1.0
    this.position = [nX, nY]
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.holdClick = e.button === 0
  }

  private handleMouseUp = () => {
    this.holdClick = false
  }

  lerp(t: number) {
    this.prevPosition[0] = this.prevPosition[0] * (1 - t) + this.position[0] * t
    this.prevPosition[1] = this.prevPosition[1] * (1 - t) + this.position[1] * t
    return [this.position[0] - this.prevPosition[0], this.position[1] - this.prevPosition[1]]
  }
}

export const mouse = new Mouse()
