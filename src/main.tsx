import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// The service worker is registered by vite-plugin-pwa (see vite.config.ts), under the app's base path.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
