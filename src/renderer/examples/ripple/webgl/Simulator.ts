import * as THREE from 'three'
import { BackBuffer } from '@scripts/webgl/core/BackBuffer'
import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import vertexShader from './shader/quad.vs'
import fragmentShader from './shader/simulator.fs'
// import { mouse } from '@scripts/mouse'
import { IdentifiedCoord, sensor } from '@scripts/sensor'
import { lerp, map } from '@scripts/utils/math'

export class Simulator extends BackBuffer {
  private static readonly INTERACTION_COUNT = 5

  private prevCoords: IdentifiedCoord[] = []

  constructor(renderer: THREE.WebGLRenderer) {
    const { width, height } = renderer.domElement
    const dpr = renderer.getPixelRatio()

    const interactions = [...Array(Simulator.INTERACTION_COUNT)].map(() => ({ coord: [0, 0], speed: 0 }))
    const fs = fragmentShader.replaceAll('INTERACTION_COUNT', Simulator.INTERACTION_COUNT.toString())

    const material = new RawShaderMaterial({
      uniforms: {
        uBackBuffer: { value: null },
        uResolution: { value: [width * dpr, height * dpr] },
        uFrame: { value: 0 },
        uInteractions: {
          value: interactions,
        },
      },
      vertexShader,
      fragmentShader: fs,
      glslVersion: '300 es',
    })

    super(renderer, material, {
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
    const prevCoords: IdentifiedCoord[] = []

    for (let i = 0; i < Simulator.INTERACTION_COUNT; i++) {
      let vel = [0, 0]
      let pos = [0, 0]

      if (i < sensor.identifiedCoords.length) {
        const iCoord = sensor.identifiedCoords[i]
        const prev = this.prevCoords.find((p) => p.id === iCoord.id)
        if (prev) {
          vel = [iCoord.coord[0] - lerp(prev.coord[0], iCoord.coord[0], 0.05), iCoord.coord[1] - lerp(prev.coord[1], iCoord.coord[1], 0.05)]
        }
        pos = [...iCoord.coord]
        prevCoords.push(sensor.clone(iCoord))
      }

      this.uniforms.uInteractions.value[i].speed = Math.min(1, Math.hypot(...vel) * 10.0)
      this.uniforms.uInteractions.value[i].coord = pos
    }

    this.prevCoords = prevCoords

    // this.uniforms.uInteractions.value[0].speed = Math.min(1, Math.hypot(...mouse.lerp(0.05)) * 10.0)
    // this.uniforms.uInteractions.value[0].coord = mouse.position

    this.uniforms.uFrame.value += 1

    const count = Math.max(1, Math.round(map(fps, 75, 120, 5, 3)))
    for (let i = 0; i < count; i++) {
      this.uniforms.uBackBuffer.value = this.backBuffer
      super.render()
    }
  }
}
