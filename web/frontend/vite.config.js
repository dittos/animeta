import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    // TODO
    // checker({
    //   typescript: true,
    // }),
  ],
})
