import { sketch } from '@scripts/sketch'
import { Canvas } from './webgl/Canvas'

const canvas = new Canvas(document.querySelector<HTMLCanvasElement>('.sketch canvas')!)

sketch.visibleCallback = () => {
  canvas.startRendering()
}

sketch.hiddenCallback = () => {
  canvas.stopRendering()
}
