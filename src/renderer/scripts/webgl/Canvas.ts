import { RawShaderMaterial } from './core/ExtendedMaterials'
import { Three } from './core/Three'
import * as THREE from 'three'
import screenVs from './shader/quad.vs'
import screenFs from './shader/screen.fs'

export class Canvas extends Three {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    this.createScreen()
    this.startRendering()
  }

  private createScreen() {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {},
      vertexShader: screenVs,
      fragmentShader: screenFs,
      glslVersion: '300 es',
    })
    const mesh = new THREE.Mesh(geo, mat)
    this.scene.add(mesh)
    return mesh
  }

  startRendering() {
    this.clock.start()
    this.renderer.setAnimationLoop(this.anime.bind(this))
  }

  stopRendering() {
    this.clock.stop()
    this.renderer.setAnimationLoop(null)
  }

  private anime() {
    this.render()
  }
}
