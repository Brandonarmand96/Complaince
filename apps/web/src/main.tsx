import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { DataProvider } from './lib/query';
import { AppErrorBoundary } from './components/shared/AsyncState';
import './globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('ComplyOS could not find its root element.');
}

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary><DataProvider><App /></DataProvider></AppErrorBoundary>
  </StrictMode>,
);
