import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import glsl from 'vite-plugin-glsl'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [tsconfigPaths(), glsl()],
    root: './src/renderer',
    build: {
      rollupOptions: {
        input: [
          resolve(__dirname, './src/renderer/index.html'),
          resolve(__dirname, './src/renderer/examples/ripple/index.html'),
          resolve(__dirname, './src/renderer/examples/rain/index.html'),
          resolve(__dirname, './src/renderer/examples/sound/index.html'),
          resolve(__dirname, './src/renderer/examples/keyboard/index.html'),
        ],
      },
    },
  },
})
