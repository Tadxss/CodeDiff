import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import DiffChecker from './components/DiffChecker.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <DiffChecker />
    </ErrorBoundary>
  </StrictMode>
);
