import '@testing-library/react';
import { vi } from 'vitest';

// Mock scrollTo as it's not implemented in jsdom
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });

// Mock IntersectionObserver as it's not implemented in jsdom
class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
});
