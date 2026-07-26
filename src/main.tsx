import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {initNativeShell} from './native.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// No-op in a browser; styles the status bar and hides the splash under Capacitor.
void initNativeShell();
