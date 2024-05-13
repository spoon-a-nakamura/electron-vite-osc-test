import { marker } from './marker'
import { sketch } from './sketch'

console.log('entry render process')

marker.show()

window.electronAPI.visibledMarkerView((visibled) => {
  if (visibled) marker.show()
  else marker.hidden()
})

window.electronAPI.visibledSketchView((visibled) => {
  if (visibled) sketch.show()
  else sketch.hidden()
})
