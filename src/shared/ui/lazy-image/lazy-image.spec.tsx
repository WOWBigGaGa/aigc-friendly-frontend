import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LazyImage } from './index';

describe('LazyImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class MockIntersectionObserver {
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      disconnect = vi.fn();
    }

    // @ts-expect-error - global is available in jsdom environment
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders placeholder when image is not loaded', () => {
    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    const wrapper = document.querySelector('[style*="background-color"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('does not render img element until in view', () => {
    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    expect(screen.queryByAltText('Test')).not.toBeInTheDocument();
  });

  it('renders img element when in view', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    await waitFor(() => {
      expect(screen.getByAltText('Test')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  it('shows placeholder until image loads', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    await waitFor(() => {
      const img = screen.getByAltText('Test');
      expect(img.style.display).toBe('none');
    });
  });

  it('hides placeholder and shows image when load succeeds', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    await waitFor(() => {
      const img = screen.getByAltText('Test');
      img.dispatchEvent(new Event('load'));
    });

    await waitFor(() => {
      const img = screen.getByAltText('Test');
      expect(img.style.display).toBe('block');
    });
  });

  it('keeps placeholder visible when image fails to load', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    await waitFor(() => {
      const img = screen.getByAltText('Test');
      img.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      const img = screen.getByAltText('Test');
      expect(img.style.display).toBe('none');
    });
  });

  it('loads image immediately when IntersectionObserver is not available', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<LazyImage src="https://example.com/image.jpg" alt="Test" />);

    await waitFor(() => {
      expect(screen.getByAltText('Test')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  it('passes className and style props to wrapper', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test"
        className="custom-class"
        style={{ width: '100px', height: '100px' }}
      />,
    );

    const wrapper = document.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('applies placeholderStyle to placeholder', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test"
        placeholderStyle={{ backgroundColor: 'red', width: '50px', height: '50px' }}
      />,
    );

    const placeholder = document.querySelector('[style*="red"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({ width: '50px', height: '50px' });
  });
});
