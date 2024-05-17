import { BackBuffer } from '@scripts/webgl/core/BackBuffer'
import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import * as THREE from 'three'
import vertexShader from './shader/quad.vs'
import fragmentShader from './shader/simulator.fs'
// import { mouse } from '@scripts/mouse'
import { sensor } from '@scripts/sensor'

export class Simulator extends BackBuffer {
  constructor(renderer: THREE.WebGLRenderer, size: [number, number]) {
    const material = new RawShaderMaterial({
      uniforms: {
        uBackBuffer: { value: null },
        uResolution: { value: [renderer.domElement.width, renderer.domElement.height] },
        uFrame: { value: 0 },
        uDeltaTime: { value: 0 },
        uMouse: { value: [2, 2] },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material, {
      dpr: 1,
      size,
      renderTargetOptions: {
        type: THREE.FloatType,
        generateMipmaps: false,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      },
    })
  }

  resize() {
    this.uniforms.uFrame.value = 0
    this.uniforms.uResolution.value = [this.renderer.domElement.width, this.renderer.domElement.height]
    super.resize()
  }

  render(dt: number) {
    this.uniforms.uFrame.value += 1
    this.uniforms.uBackBuffer.value = this.backBuffer
    this.uniforms.uDeltaTime.value = dt

    if (sensor.coords) {
      if (0 < sensor.coords.length) {
        this.uniforms.uMouse.value = sensor.coords[0]
      } else {
        this.uniforms.uMouse.value = [2, 2]
      }
    }

    super.render()
  }
}
