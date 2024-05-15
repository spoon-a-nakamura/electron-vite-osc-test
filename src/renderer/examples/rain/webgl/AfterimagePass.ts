import { BackBuffer } from '@scripts/webgl/core/BackBuffer'
import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import * as THREE from 'three'
import vertexShader from './shader/quad.vs'
import fragmentShader from './shader/afterimage.fs'

export class AfterimagePass extends BackBuffer {
  constructor(renderer: THREE.WebGLRenderer, source: THREE.Texture) {
    const material = new RawShaderMaterial({
      uniforms: {
        uSource: { value: source },
        uBackBuffer: { value: null },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material)
  }

  render() {
    this.uniforms.uBackBuffer.value = this.backBuffer
    super.render()
  }
}
