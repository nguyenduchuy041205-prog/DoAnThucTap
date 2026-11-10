import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  envDir: '../..',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cropcoop.svg'],
      manifest: {
        name: 'CROP COOP — Quản lý hợp tác xã',
        short_name: 'CROP COOP',
        description: 'Quản lý mùa vụ và nhật ký sản xuất nông nghiệp',
        theme_color: '#173f35',
        background_color: '#f5f7f2',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/cropcoop.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
