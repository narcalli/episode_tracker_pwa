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
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'CareJourney - Episode Tracker',
        short_name: 'CareJourney',
        description: 'Patient Episodic Treatment & Milestone Tracker',
        // A stable id keeps the installed app the same app if start_url ever changes.
        id: base,
        start_url: base,
        scope: base,
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        // Lets Chrome's getInstalledRelatedApps() say this app is already installed (see src/utils/pwaInstall.ts). The url
        // is read against the manifest's own address, so it needs no host name.
        related_applications: [{ platform: 'webapp', url: 'manifest.webmanifest' }],
        icons: [
          // Chrome only offers "Install app" with real icons at 192 and 512. Keep "any" and "maskable" as separate
          // files: one file declared as both gets cropped on Android or shows a white box on desktop.
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
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
