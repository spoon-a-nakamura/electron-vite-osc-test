import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import { Three } from '@scripts/webgl/core/Three'
import * as THREE from 'three'
import screenVs from './shader/quad.vs'
import screenFs from './shader/screen.fs'
import { Simulator } from './Simulator'
import { Fps } from '@scripts/utils/Fps'

export class Canvas extends Three {
  private screen!: THREE.Mesh<THREE.PlaneGeometry, RawShaderMaterial>
  private simulator: Simulator
  private fps: Fps

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.simulator = new Simulator(this.renderer)
    this.fps = new Fps()

    this.loadTexture().then((texture) => {
      this.screen = this.createScreen(texture)
      window.addEventListener('resize', this.resize.bind(this))
      this.startRendering()
    })
  }

  private async loadTexture() {
    const loader = new THREE.TextureLoader()
    // https://vitejs.dev/guide/assets#new-url-url-import-meta-url
    const texture = await loader.loadAsync(new URL('/assets/images/color_checker.webp', import.meta.url).href)
    texture.userData.aspect = texture.source.data.width / texture.source.data.height
    return texture
  }

  private createScreen(texture: THREE.Texture) {
    const dpr = this.renderer.getPixelRatio()

    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {
        uSim: { value: null },
        uImage: { value: texture },
        uCoveredScale: { value: this.coveredScale(texture.userData.aspect) },
        uResolution: { value: [this.size.width * dpr, this.size.height * dpr] },
      },
      vertexShader: screenVs,
      fragmentShader: screenFs,
      glslVersion: '300 es',
    })
    const mesh = new THREE.Mesh(geo, mat)
    this.scene.add(mesh)
    return mesh
  }

  private resize() {
    this.simulator.resize()

    const dpr = this.renderer.getPixelRatio()
    const uniforms = this.screen.material.uniforms
    uniforms.uCoveredScale.value = this.coveredScale(uniforms.uImage.value.userData.aspect)
    uniforms.uResolution.value = [this.size.width * dpr, this.size.height * dpr]
  }

  startRendering() {
    this.clock.start()
    this.renderer.setAnimationLoop(this.anime.bind(this))
  }

  stopRendering() {
    this.clock.stop()
    this.fps.clear()
    this.renderer.setAnimationLoop(null)
  }

  private anime() {
    const fps = this.fps.update()

    this.simulator.render(fps)

    this.screen.material.uniforms.uSim.value = this.simulator.texture
    this.render()
  }
}
