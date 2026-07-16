import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Fetch the studio configuration asynchronously in the background as early as possible
fetch('/api/studio-config')
  .then(res => {
    if (res.ok) {
      return res.json().catch(() => null);
    }
    return null;
  })
  .then(config => {
    if (config) {
      (window as any).__STUDIO_CONFIG__ = config;
    } else {
      (window as any).__STUDIO_CONFIG__ = { firebase: null, portalPassword: null };
    }
  })
  .catch(e => {
    console.warn("Failed to fetch studio-config asynchronously:", e);
    (window as any).__STUDIO_CONFIG__ = { firebase: null, portalPassword: null };
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
