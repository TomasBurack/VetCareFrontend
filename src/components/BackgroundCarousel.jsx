import { useEffect, useState } from 'react';

const SLIDE_DURATION_MS = 6000;

export function BackgroundCarousel({ images, className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className={`bg-carousel ${className}`.trim()} aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={`bg-carousel-slide ${i === activeIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="bg-carousel-overlay" />
    </div>
  );
}
