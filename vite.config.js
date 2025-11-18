import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages deployment:
// - If your repo is 'username.github.io', set base to '/'
// - Otherwise, set base to '/repository-name/'
const REPO_NAME = 'spotyfy'
const base = process.env.GITHUB_PAGES === 'true' ? `/${REPO_NAME}/` : '/'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: base,
})

