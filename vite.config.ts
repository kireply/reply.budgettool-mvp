import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file build: all JS/CSS is inlined into index.html. The privately
// published GitHub Pages proxy serves module scripts with a wrong MIME type
// (application/octet-stream), which browsers reject — inline scripts avoid
// any external module fetch entirely.
export default defineConfig({
  base: '/reply-budgettool-mvp/',
  plugins: [react(), viteSingleFile()],
})
