import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base 경로: 로컬/PMS는 './', GitHub Pages는 빌드 시 --base=/zlsu/ 옵션 사용
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
  },
})
