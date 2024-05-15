import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import { FrameBuffer } from '@scripts/webgl/core/FrameBuffer'
import * as THREE from 'three'
import fragmentShader from './shader/output.fs'
import vertexShader from './shader/quad.vs'

export class OutputPass extends FrameBuffer {
  constructor(renderer: THREE.WebGLRenderer) {
    const material = new RawShaderMaterial({
      uniforms: {
        uSource: { value: null },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material)
  }
}
