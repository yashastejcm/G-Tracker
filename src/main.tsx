import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker with update prompt
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    const shouldReload = confirm('New update available. Reload to update?');
    if (shouldReload) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to use offline');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
