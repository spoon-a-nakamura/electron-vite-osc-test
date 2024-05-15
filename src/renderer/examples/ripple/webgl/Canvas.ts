/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
    super(canvas, { dpr: 1 })

    this.simulator = new Simulator(this.renderer)
    this.fps = new Fps()

    this.loadVideoTexture().then(({ texture, aspect }) => {
      this.screen = this.createScreen(texture, aspect)
      window.addEventListener('resize', this.resize.bind(this))
      this.resize()
      this.startRendering()
    })
  }

  // private async loadTexture() {
  //   const loader = new THREE.TextureLoader()
  //   // https://vitejs.dev/guide/assets#new-url-url-import-meta-url
  //   const texture = await loader.loadAsync(
  //     new URL('/assets/images/color_checker.webp', import.meta.url).href
  //   )
  //   texture.userData.aspect = texture.source.data.width / texture.source.data.height
  //   return texture
  // }

  private async loadVideoTexture() {
    const video = document.createElement('video')
    video.src = new URL('../videos/sea.mp4', import.meta.url).href
    video.loop = true
    video.muted = true
    video.play()

    await new Promise<void>((resolve) => {
      video.onloadeddata = () => resolve()
    })

    const texture = new THREE.VideoTexture(video)
    texture.needsUpdate = true

    return {
      texture,
      aspect: video.videoWidth / video.videoHeight
    }
  }

  private createScreen(texture: THREE.Texture, aspect: number) {
    const dpr = this.renderer.getPixelRatio()

    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {
        uSim: { value: null },
        uImage: { value: texture },
        uCoveredScale: { value: this.coveredScale(aspect) },
        uResolution: { value: [this.size.width * dpr, this.size.height * dpr] }
      },
      vertexShader: screenVs,
      fragmentShader: screenFs,
      glslVersion: '300 es'
    })
    const mesh = new THREE.Mesh(geo, mat)
    this.scene.add(mesh)
    return mesh
  }

  private resize() {
    this.simulator.resize()

    const dpr = this.renderer.getPixelRatio()
    const uniforms = this.screen.material.uniforms
    uniforms.uCoveredScale.value = this.coveredScale(
      uniforms.uImage.value.image.videoWidth / uniforms.uImage.value.image.videoHeight
    )
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
