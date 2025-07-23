import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { registerSW } from 'virtual:pwa-register';

// Register the service worker from vite-plugin-pwa
registerSW({
  onNeedRefresh() {
    console.log('⚠️ New content is available. Please refresh.');
  },
  onOfflineReady() {
    console.log('✅ App is ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
