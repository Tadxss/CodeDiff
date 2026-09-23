import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

// jsdom has no layout engine and no ResizeObserver; react-window (used for virtualized
// diff rendering) relies on ResizeObserver to measure its container and rows.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
