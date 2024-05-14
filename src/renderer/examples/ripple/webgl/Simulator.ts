import * as THREE from 'three'
import { BackBuffer } from '@scripts/webgl/core/BackBuffer'
import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import vertexShader from './shader/quad.vs'
import fragmentShader from './shader/simulator.fs'
// import { mouse } from '@scripts/mouse'
import { IdentifiedCoord, datas } from '@scripts/datas'
import { lerp, map } from '@scripts/utils/math'

export class Simulator extends BackBuffer {
  private prevCoord: IdentifiedCoord = { id: '', coord: [0, 0] }

  constructor(renderer: THREE.WebGLRenderer) {
    const { width, height } = renderer.domElement
    // const dpr = renderer.getPixelRatio()
    const dpr = 1.0

    const material = new RawShaderMaterial({
      uniforms: {
        uBackBuffer: { value: null },
        uResolution: { value: [width * dpr, height * dpr] },
        uFrame: { value: 0 },
        uSpeed: { value: 0 },
        uMouse: { value: [0, 0] },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material, {
      dpr,
      renderTargetOptions: {
        type: THREE.FloatType,
        generateMipmaps: false,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        wrapS: THREE.MirroredRepeatWrapping,
        wrapT: THREE.MirroredRepeatWrapping,
      },
    })
  }

  resize() {
    super.resize()
    this.uniforms.uFrame.value = 0
    this.uniforms.uResolution.value = [this.size.width, this.size.height]
  }

  render(fps: number) {
    let vel = [0, 0]
    let pos = [...this.prevCoord.coord]
    const continuousCoord = datas.identifiedCoordinates.find((ic) => ic.id === this.prevCoord.id)
    if (continuousCoord) {
      vel = [
        continuousCoord.coord[0] - lerp(this.prevCoord.coord[0], continuousCoord.coord[0], 0.05),
        continuousCoord.coord[1] - lerp(this.prevCoord.coord[1], continuousCoord.coord[1], 0.05),
      ]
      pos = [...continuousCoord.coord]
    } else if (0 < datas.identifiedCoordinates.length) {
      this.prevCoord = { ...datas.identifiedCoordinates[0] }
      pos = [...this.prevCoord.coord]
    }

    // const speed = Math.hypot(...mouse.lerp(0.05))
    // this.uniforms.uSpeed.value = Math.min(speed * 10.0, 1)
    // this.uniforms.uMouse.value = mouse.position
    const speed = Math.hypot(...vel)
    this.uniforms.uSpeed.value = Math.min(speed * 10.0, 1)
    this.uniforms.uMouse.value = pos
    this.uniforms.uFrame.value += 1

    const count = Math.max(1, Math.round(map(fps, 75, 120, 5, 3)))

    for (let i = 0; i < count; i++) {
      this.uniforms.uBackBuffer.value = this.backBuffer
      super.render()
    }
  }
}
