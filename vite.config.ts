import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// 相对 base:产物可直接丢到任意静态托管 / 本地 file:// 之外的任意子路径下。
export default defineConfig({
  base: './',
  plugins: [svelte()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
  },
})
