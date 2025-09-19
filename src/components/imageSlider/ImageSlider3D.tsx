"use client";
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImagesProps } from "@/types/types";
import { LangContext } from "@/contexts/LangContext";

export default function ImageSlider3D({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  title
}: ImagesProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, open]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Touch/Mouse handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        prev();
      } else {
        next();
      }
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };
  const { t, dir } = useContext(LangContext);
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, prev, next]);

  const getImageStyle = (i: number) => {
    const offset = i - index;
    let transform = '';
    let opacity = 1;
    let zIndex = 1;

    // Calculate drag offset for smooth dragging
    const dragOffset = isDragging ? (currentX - startX) * 0.5 : 0;

    if (offset === 0) {
      transform = `translateX(${dragOffset}px) scale(1) rotateY(0deg)`;
      zIndex = 3;
    } else if (offset === -1 || (offset === images.length - 1 && index === 0)) {
      transform = `translateX(${-100 + dragOffset}px) scale(0.85) rotateY(25deg)`;
      zIndex = 2;
    } else if (offset === 1 || (offset === -(images.length - 1) && index === images.length - 1)) {
      transform = `translateX(${100 + dragOffset}px) scale(0.85) rotateY(-25deg)`;
      zIndex = 2;
    } else {
      opacity = 0;
      zIndex = 1;
      transform = `translateX(${offset > 0 ? 200 : -200}px) scale(0.7) rotateY(${offset > 0 ? -45 : 45}deg)`;
    }

    return {
      transform,
      opacity,
      zIndex,
      transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6" 
        dir={dir}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl truncate">{title}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Main slider container */}
          <div 
            ref={sliderRef}
            className="relative h-48 sm:h-64 md:h-72 lg:h-80 overflow-hidden rounded-lg"
            style={{ 
              perspective: '1000px',
              perspectiveOrigin: 'center center'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={isDragging ? handleMouseMove : undefined}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                style={getImageStyle(i)}
              >
                <img
                  src={img}
                  alt={`Slide ${i + 1} of ${images.length}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows - hidden on very small screens */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10 hidden sm:flex"
            aria-label="Previous image"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10 hidden sm:flex"
            aria-label="Next image"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 ${
                i === index 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Image counter */}
        <div className="text-center text-sm text-gray-500 mt-2">
          {index + 1} / {images.length}
        </div>

        {/* Mobile instructions */}
        <div className="text-center text-xs text-gray-400 mt-2 sm:hidden">
          {t("SwipeNavigate")}
        </div>
      </DialogContent>
    </Dialog>
  );
}