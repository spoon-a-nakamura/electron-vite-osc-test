import { sensor } from '@scripts/sensor'
// import { mouse } from '@scripts/mouse'
import * as Tone from 'tone'

type CircleData = {
  direction: [number, number]
  note: string
}

const synth = new Tone.Synth().toDestination()

const circles = document.querySelectorAll<HTMLElement>('.sketch span')
const circleMap = new WeakMap<HTMLElement, CircleData>()

// circle elementのデータを生成する
for (const circle of circles) {
  // 移動方向をランダムに決める
  let dirX = Math.random() * 2.0 - 1.0
  let dirY = Math.random() * 2.0 - 1.0
  dirX /= Math.hypot(dirX, dirY)
  dirY /= Math.hypot(dirX, dirY)

  circleMap.set(circle, { direction: [dirX, dirY], note: circle.innerText })
}

let prevTime = performance.now()

function anime() {
  const currentTime = performance.now()
  const dt = (currentTime - prevTime) / 1000
  prevTime = currentTime

  for (const circle of circles) {
    const circleData = circleMap.get(circle)!

    // 移動アニメーション
    let x = Number.parseFloat(circle.style.getPropertyValue('--x'))
    let y = Number.parseFloat(circle.style.getPropertyValue('--y'))
    const direction = circleData.direction
    x += direction[0] * dt * 0.3
    y += direction[1] * dt * 0.3
    if (x < -1 || 1 < x) direction[0] *= -1
    if (y < -1 || 1 < y) direction[1] *= -1
    circle.style.setProperty('--x', x.toString())
    circle.style.setProperty('--y', y.toString())

    //
    if (sensor.coords && 0 < sensor.coords.length) {
      for (const coord of sensor.coords) {
        // 接触判定
        const rect = circle.getBoundingClientRect()
        const nX = ((rect.x + rect.width * 0.5) / window.innerWidth) * 2.0 - 1.0
        const nY = (1.0 - (rect.y + rect.height * 0.5) / window.innerHeight) * 2.0 - 1.0
        const radius = (rect.width * 0.5) / (window.innerWidth * 0.5)
        const aspect = window.innerWidth / window.innerHeight
        // const distance = Math.hypot(mouse.position[0] - nX, (mouse.position[1] - nY) / aspect)
        const distance = Math.hypot(coord[0] - nX, (coord[1] - nY) / aspect)
        const inCircle = distance < radius
        if (!inCircle) {
          // 非アクティブにする
          circle.classList.remove('active')
        } else if (!circle.classList.contains('active')) {
          // 音を鳴らす
          circle.classList.add('active')
          synth.triggerAttackRelease(circleData.note, '32n')
          break
        }
      }
    } else {
      circle.classList.remove('active')
    }
  }

  requestAnimationFrame(anime)
}

anime()
