import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from './theme-provider';
import { useTheme } from './use-theme';

function TestComponent() {
  const { isDark, setIsDark, fontScale, setFontScale } = useTheme();

  return (
    <div>
      <span data-testid="is-dark">{String(isDark)}</span>
      <span data-testid="font-scale">{fontScale}</span>
      <button data-testid="toggle-theme" onClick={() => setIsDark((prev) => !prev)}>
        Toggle Theme
      </button>
      <button data-testid="set-compact" onClick={() => setFontScale('compact')}>
        Compact
      </button>
      <button data-testid="set-standard" onClick={() => setFontScale('standard')}>
        Standard
      </button>
      <button data-testid="set-comfortable" onClick={() => setFontScale('comfortable')}>
        Comfortable
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    document.documentElement.style.fontSize = '';
  });

  it('initializes with light theme and standard font scale when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(screen.getByTestId('font-scale').textContent).toBe('standard');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('restores dark theme from localStorage', () => {
    localStorage.setItem('color-scheme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('is-dark').textContent).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('restores font scale from localStorage', () => {
    localStorage.setItem('font-scale', 'compact');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('font-scale').textContent).toBe('compact');
  });

  it('falls back to standard font scale for invalid stored value', () => {
    localStorage.setItem('font-scale', 'invalid');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('font-scale').textContent).toBe('standard');
  });

  it('toggles dark/light theme when button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(screen.getByTestId('toggle-theme'));

    expect(screen.getByTestId('is-dark').textContent).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('color-scheme')).toBe('dark');

    fireEvent.click(screen.getByTestId('toggle-theme'));

    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(localStorage.getItem('color-scheme')).toBe('light');
  });

  it('changes font scale when buttons are clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('font-scale').textContent).toBe('standard');

    fireEvent.click(screen.getByTestId('set-compact'));
    expect(screen.getByTestId('font-scale').textContent).toBe('compact');
    expect(localStorage.getItem('font-scale')).toBe('compact');

    fireEvent.click(screen.getByTestId('set-comfortable'));
    expect(screen.getByTestId('font-scale').textContent).toBe('comfortable');
    expect(localStorage.getItem('font-scale')).toBe('comfortable');
  });

  it('persists theme to localStorage on toggle', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(localStorage.getItem('color-scheme')).toBe('light');

    fireEvent.click(screen.getByTestId('toggle-theme'));

    expect(localStorage.getItem('color-scheme')).toBe('dark');
  });

  it('handles localStorage unavailable gracefully', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(() => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(screen.getByTestId('font-scale').textContent).toBe('standard');

    fireEvent.click(screen.getByTestId('toggle-theme'));

    expect(screen.getByTestId('is-dark').textContent).toBe('true');

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});
