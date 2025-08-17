import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ImageWithPlaceholder from './ImageWithPlaceholder';

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(initialIndex);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), 150);
  }, [isTransitioning, currentIndex, images.length]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), 150);
  }, [isTransitioning, currentIndex, images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  }, [isOpen, onClose, handlePrevious, handleNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, isTransitioning, onClose, handlePrevious, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          disabled={isTransitioning}
          className="absolute left-4 text-white hover:text-gray-300 transition-colors disabled:opacity-50 z-10"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          disabled={isTransitioning}
          className="absolute right-4 text-white hover:text-gray-300 transition-colors disabled:opacity-50 z-10"
          aria-label="Next image"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Main Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <ImageWithPlaceholder
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          className={`max-w-full max-h-full object-contain transition-opacity duration-150 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-[80vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                if (isTransitioning || index === currentIndex) return;
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 150);
              }}
              className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all duration-150 ${
                index === currentIndex
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <ImageWithPlaceholder
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;