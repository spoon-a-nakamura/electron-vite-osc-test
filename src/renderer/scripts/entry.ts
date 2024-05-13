import { marker } from './marker'
import { sketch } from './sketch'

console.log('entry render process')

marker.visible()

window.electronAPI.visibledMarkerView((visibled) => {
  if (visibled) marker.visible()
  else marker.hidden()
})

window.electronAPI.visibledSketchView((visibled) => {
  if (visibled) sketch.visible()
  else sketch.hidden()
})
