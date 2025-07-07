import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import checker from 'vite-plugin-checker'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    !isSsrBuild && nodePolyfills(),
    checker({
      typescript: true,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        admin: 'index-admin.html',
      },
    },
    assetsDir: 'build',
  },
  ssr: {
    noExternal: isSsrBuild,
  },
  publicDir: 'static',
  experimental: {
    renderBuiltUrl: (filename, type) => {
      if (type.hostType === 'html') {
        // For resources in HTML files, we use a placeholder that will be replaced by the server
        return '__STATIC__/' + filename
      }
      throw new Error(`Unsupported type: ${JSON.stringify(type)}`)
    },
  },
}))
