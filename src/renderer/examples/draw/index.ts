const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.lineCap = 'round'
ctx.lineWidth = 3
ctx.strokeStyle = '#000'

ctx.beginPath()
ctx.moveTo(0, 0)
ctx.lineTo(50, 100)
ctx.stroke()

function covertCoord(normalizedCoord: [number, number]) {
  // normalizedCoord[0] =
}
