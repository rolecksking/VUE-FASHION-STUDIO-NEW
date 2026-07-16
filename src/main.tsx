import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

async function init() {
  try {
    const res = await fetch('/api/studio-config');
    if (res.ok) {
      const config = await res.json();
      (window as any).__STUDIO_CONFIG__ = config;
    } else {
      (window as any).__STUDIO_CONFIG__ = { firebase: null, portalPassword: null };
    }
  } catch (e) {
    console.warn("Failed to fetch studio-config asynchronously:", e);
    (window as any).__STUDIO_CONFIG__ = { firebase: null, portalPassword: null };
  } finally {
    const { default: App } = await import('./App.tsx');
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

init();
