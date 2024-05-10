import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [glsl()],
  },
})
