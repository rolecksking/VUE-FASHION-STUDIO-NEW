import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

async function init() {
  try {
    // 2-second timeout to prevent blank screen hangs if server configuration is slow/hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/studio-config', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const config = await res.json();
      (window as any).__STUDIO_CONFIG__ = config;
    } else {
      (window as any).__STUDIO_CONFIG__ = { firebase: null, portalPassword: null };
    }
  } catch (e) {
    console.warn("Failed to fetch studio-config asynchronously (timed out or failed):", e);
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
