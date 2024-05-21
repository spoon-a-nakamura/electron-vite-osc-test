import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import glsl from 'vite-plugin-glsl'
import tsconfigPaths from 'vite-tsconfig-paths'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [tsconfigPaths(), glsl(), wasm(), topLevelAwait()],
    root: './src/renderer',
    build: {
      rollupOptions: {
        input: [
          resolve(__dirname, './src/renderer/index.html'),
          resolve(__dirname, './src/renderer/examples/ripple/index.html'),
          resolve(__dirname, './src/renderer/examples/rain/index.html'),
          resolve(__dirname, './src/renderer/examples/sound/index.html'),
          resolve(__dirname, './src/renderer/examples/keyboard/index.html'),
          resolve(__dirname, './src/renderer/examples/draw/index.html'),
          // wip
          resolve(__dirname, './src/renderer/examples/physics/index.html'),
          resolve(__dirname, './src/renderer/examples/voice_draw/index.html'),
        ],
      },
    },
  },
})
