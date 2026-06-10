import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the app from /<repo-name>/ — the deploy workflow sets DEPLOY_TARGET.
// Local dev and preview keep the root base.
export default defineConfig({
  base: process.env.DEPLOY_TARGET === 'gh-pages' ? '/a2a.budgettool-mvp/' : '/',
  plugins: [react()],
})
