import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import { Three } from '@scripts/webgl/core/Three'
import * as THREE from 'three'
import vertexShader from './shader/point.vs'
import fragmentShader from './shader/point.fs'
import { Simulator } from './Simulator'
import { AfterimagePass } from './AfterimagePass'
import { OutputPass } from './OutputPass'

export class Canvas extends Three {
  private mainRenderTarget: THREE.WebGLRenderTarget
  private simulator: Simulator
  private points: THREE.Points<THREE.BufferGeometry, RawShaderMaterial>
  private afterimagePass: AfterimagePass
  private outputPass: OutputPass

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { dpr: 1 })

    this.init()
    this.mainRenderTarget = this.createMainRenderTarget()

    this.simulator = new Simulator(this.renderer, [256, 256])
    this.points = this.createPoints()

    this.afterimagePass = new AfterimagePass(this.renderer, this.mainRenderTarget.texture)
    this.outputPass = new OutputPass(this.renderer)

    window.addEventListener('resize', this.resize.bind(this))
    this.startRendering()
  }

  private init() {
    this.scene.background = new THREE.Color('#000')
  }

  private createMainRenderTarget() {
    const { width, height } = this.size
    const dpr = this.renderer.getPixelRatio()
    return new THREE.WebGLRenderTarget(width * dpr, height * dpr)
  }

  private createPoints() {
    const geo = new THREE.BufferGeometry()

    const positions: number[] = []
    const simUvs: number[] = []
    for (let ix = 0; ix < this.simulator.size.width; ix++) {
      for (let iy = 0; iy < this.simulator.size.height; iy++) {
        positions.push(0, 0, 0)
        simUvs.push(ix / this.simulator.size.width, iy / this.simulator.size.height)
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('simUv', new THREE.Float32BufferAttribute(simUvs, 2))

    const mat = new RawShaderMaterial({
      uniforms: {
        uSim: { value: null },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    const mesh = new THREE.Points(geo, mat)
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

  resize() {
    const { width, height } = this.size
    const dpr = this.renderer.getPixelRatio()
    this.mainRenderTarget.setSize(width * dpr, height * dpr)

    this.simulator.resize()
    this.afterimagePass.resize()
    this.outputPass.resize()
  }

  private anime() {
    const dt = this.clock.getDelta()

    this.simulator.render(dt)

    this.points.material.uniforms.uSim.value = this.simulator.texture
    this.renderer.setRenderTarget(this.mainRenderTarget)
    this.renderer.render(this.scene, this.camera)

    this.afterimagePass.render()

    this.outputPass.uniforms.uSource.value = this.afterimagePass.texture
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.outputPass.scene, this.outputPass.camera)
  }
}
