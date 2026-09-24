import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { DataProvider } from './lib/query';
import { AppErrorBoundary } from './components/shared/AsyncState';
import { AuthProvider } from './lib/auth';
import './globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('ComplyOS could not find its root element.');
}

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary><DataProvider><AuthProvider><App /></AuthProvider></DataProvider></AppErrorBoundary>
  </StrictMode>,
);
