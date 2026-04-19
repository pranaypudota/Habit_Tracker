import '@testing-library/react';
import { vi } from 'vitest';

// Mock scrollTo as it's not implemented in jsdom
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
