import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const DotButton = ({ selected, onClick }) => (
  <button
    className={`embla__dot ${selected ? 'is-selected' : ''}`}
    type="button"
    onClick={onClick}
  />
);

const PrevNextButton = ({ enabled, onClick }) => (
  <button
    className="embla__button"
    onClick={onClick}
    disabled={!enabled}
  >
    <svg className="embla__button__svg" viewBox="0 0 24 24">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  </button>
);

const Advertisement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 7000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, setScrollSnaps, onSelect]);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/advertisement/');
        if (response.ok) {
          const data = await response.json();
          setAdvertisements(data);
        } else {
          console.error('Failed to fetch advertisements.');
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      }
    };

    fetchAdvertisements();
  }, []);

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {advertisements.length > 0 ? (
          advertisements.map((ad) => (
            <div className="embla__slide" key={ad.id}>
              <div style={{ maxWidth: '1600px', height: '320px', margin: 'auto', position: 'relative' }}>
                <img src={ad.image} alt={`Advertisement ${ad.id}`} className="w-full h-full object-contain rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          <div className="embla__slide">
            <div className="bg-gray-200 p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Advertisements</h2>
              <p>This is a placeholder for advertisements.</p>
            </div>
          </div>
        )}
      </div>
      <PrevNextButton onClick={scrollPrev} enabled={prevBtnEnabled} />
      <PrevNextButton onClick={scrollNext} enabled={nextBtnEnabled} />
      <div className="embla__dots">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            selected={index === selectedIndex}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Advertisement;
