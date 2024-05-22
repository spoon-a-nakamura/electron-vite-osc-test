// import { mouse } from '@scripts/mouse'
import { sensor } from '@scripts/sensor'
import { lerp } from '@scripts/utils/math'

type XY = [number, number]

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

function setup() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  ctx.lineCap = 'round'
  ctx.lineWidth = 10
  ctx.strokeStyle = '#000'
}

function convertCoord(normalizedCoord: [number, number]) {
  let x = (normalizedCoord[0] * 0.5 + 0.5) * canvas.width
  let y = (1.0 - (normalizedCoord[1] * 0.5 + 0.5)) * canvas.height
  return [x, y]
}

function draw(n0: XY, n1: XY) {
  const start = convertCoord(n0)
  const end = convertCoord(n1)

  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  ctx.lineTo(end[0], end[1])
  ctx.stroke()
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  setup()
})

setup()

// ---
let prev: XY = [0, 0]
let prevHoldState = false

// function anime() {
//   if (mouse.holdClick) {
//     if (!prevHoldState) {
//       prev = [...mouse.position]
//     } else {
//       const currentX = lerp(prev[0], mouse.position[0], 0.5)
//       const currentY = lerp(prev[1], mouse.position[1], 0.5)
//       draw(prev, [currentX, currentY])
//       prev = [currentX, currentY]
//     }
//   }
//   prevHoldState = mouse.holdClick
//   // fill()

//   requestAnimationFrame(anime)
// }

function anime() {
  if (sensor.coords) {
    const intersect = 0 < sensor.coords.length
    if (intersect) {
      const coord = sensor.coords[0]

      if (!prevHoldState) {
        prev = [...coord]
      } else if (Math.hypot(coord[0] - prev[0], coord[1] - prev[1]) < 0.3) {
        const currentX = lerp(prev[0], coord[0], 0.3)
        const currentY = lerp(prev[1], coord[1], 0.3)
        draw(prev, [currentX, currentY])
        prev = [currentX, currentY]
      }
    }
    prevHoldState = intersect
  }

  requestAnimationFrame(anime)
}

anime()
