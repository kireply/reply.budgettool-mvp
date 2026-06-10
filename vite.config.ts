import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pages is published with private visibility: GitHub serves it at the root of a
// dedicated *.pages.github.io subdomain, so the default root base is correct.
export default defineConfig({
  plugins: [react()],
})
