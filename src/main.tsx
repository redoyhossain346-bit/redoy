import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add a visible indicator if the app crashes during load
window.onerror = function(msg, url, lineNo, columnNo, error) {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 20px; color: white; background: #1e293b; border-radius: 12px; margin: 20px; font-family: sans-serif; border: 1px solid #ef4444;">
        <h1 style="color: #ef4444; margin-top: 0;">Application Load Error</h1>
        <p>Something went wrong while starting the app locally. This is likely a browser compatibility issue or a storage permission problem.</p>
        <pre style="background: #0f172a; padding: 10px; border-radius: 6px; overflow: auto; font-size: 12px;">${msg}</pre>
        <button onclick="localStorage.clear(); location.reload();" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Clear Storage & Retry</button>
      </div>
    `;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<h1>Critical Error: Root element not found</h1>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    rootElement.innerHTML = `<h1 style="color: red">Render Error: ${err instanceof Error ? err.message : 'Unknown error'}</h1>`;
    console.error(err);
  }
}
