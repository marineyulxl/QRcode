import path from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import type { ProxyOptions } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 仅 `pnpm dev` / `pnpm preview` 生效；生产由 Nginx 等同源反代。
 * 代理 target 写在本文件，换环境时直接改下面常量或各 `target` 字段。
 */
const devProxy: Record<string, string | ProxyOptions> = {
  '/admin-api': {
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/admin-api/, ''),
    target: 'http://52.83.235.221:48080/admin-api',
    ws: true,
  },
  '/dataRoomServer': {
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/dataRoomServer/, ''),
    target: 'http://192.168.201.167:48080/dataRoomServer',
    ws: true,
  },
  '/file-server': {
    changeOrigin: true,
    rewrite: (p) =>
      p
        .replaceAll(/([?&])_=\d+/g, '$1')
        .replace(/\?&/, '?')
        .replace(/[?&]$/, ''),
    target: 'https://agent-test.antonoil.com',
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    proxy: devProxy,
  },
  preview: {
    host: true,
    port: 4173,
    proxy: devProxy,
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },
})
