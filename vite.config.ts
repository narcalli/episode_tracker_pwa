import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The app must be served from the same origin as the Patient 360 portal so the portal's session cookie is the app's
// session too (that is what signs a person in automatically). In production it lives under a path of the portal's
// domain: build with VITE_BASE=/journey/ (leading and trailing slash). In dev, /api goes to the local API, as the
// portal's own dev server does, and cookies on localhost are shared across ports.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE || '/';
  return {
  base,
  server: {
    proxy: { '/api': env.API_ORIGIN || 'http://localhost:3000' }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CareJourney - Episode Tracker',
        short_name: 'CareJourney',
        description: 'Patient Episodic Treatment & Milestone Tracker',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Patient data is never cached by the service worker: only the app shell is. /api always goes to the network.
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ]
  };
});
