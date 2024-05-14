import { RawShaderMaterial } from '@scripts/webgl/core/ExtendedMaterials'
import { Three } from '@scripts/webgl/core/Three'
import * as THREE from 'three'
import screenVs from './shader/quad.vs'
import screenFs from './shader/screen.fs'

export class Canvas extends Three {
  private screen!: THREE.Mesh<THREE.PlaneGeometry, RawShaderMaterial>

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.loadTexture().then((texture) => {
      this.screen = this.createScreen(texture)
      window.addEventListener('resize', this.resize.bind(this))
      this.startRendering()
    })
  }

  private async loadTexture() {
    const loader = new THREE.TextureLoader()
    // https://vitejs.dev/guide/assets#new-url-url-import-meta-url
    const texture = await loader.loadAsync(new URL('/assets/images/unsplash_1.webp', import.meta.url).href)
    texture.userData.aspect = texture.source.data.width / texture.source.data.height
    return texture
  }

  private createScreen(texture: THREE.Texture) {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new RawShaderMaterial({
      uniforms: {
        uImage: { value: texture },
        uCoveredScale: { value: this.coveredScale(texture.userData.aspect) },
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
    const uniforms = this.screen.material.uniforms
    uniforms.uCoveredScale.value = this.coveredScale(uniforms.uImage.value.userData.aspect)
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
