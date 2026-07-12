import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholderStyle?: React.CSSProperties;
  retryCount?: number;
}

export function LazyImage({
  src,
  alt,
  className,
  style,
  placeholderStyle,
  retryCount = 2,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [, setAttempts] = useState(0);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoaded(false);
    setAttempts((prev) => {
      if (prev < retryCount) {
        setTimeout(
          () => {
            setIsLoaded(false);
          },
          1000 * (prev + 1),
        );
        return prev + 1;
      }
      setHasError(true);
      return prev;
    });
  };

  return (
    <div ref={imgRef} className={className} style={style}>
      {!isLoaded && (
        <div
          style={{
            backgroundColor: 'var(--ant-color-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...placeholderStyle,
          }}
        >
          {hasError ? (
            <span style={{ color: 'var(--ant-color-text-tertiary)', fontSize: '12px' }}>
              图片加载失败
            </span>
          ) : (
            <div className="loading-spinner loading-spinner-sm" />
          )}
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            display: isLoaded ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}
