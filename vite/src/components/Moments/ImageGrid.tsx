import React, { useState } from 'react';
import ImageWithPlaceholder from '../Common/ImageWithPlaceholder';
import ImageViewer from '../Common/ImageViewer';

interface ImageGridProps {
  images: string[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageCount = images.length;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setViewerOpen(true);
  };

  if (imageCount === 0) return null;

  // Single image
  if (imageCount === 1) {
    return (
      <>
        <div className="rounded-lg overflow-hidden mb-3 cursor-pointer hover:opacity-90 transition-opacity">
          <ImageWithPlaceholder
            src={images[0]}
            alt="Moment"
            className="w-full h-auto max-h-80 object-cover"
            onClick={() => handleImageClick(0)}
          />
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Two images
  if (imageCount === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mb-3">
          {images.slice(0, 2).map((image, index) => (
            <div key={index} className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={image}
                alt={`Moment ${index + 1}`}
                className="w-full h-48 object-cover"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Three images
  if (imageCount === 3) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mb-3 h-48">
          <div className="cursor-pointer hover:opacity-90 transition-opacity">
            <ImageWithPlaceholder
              src={images[0]}
              alt="Moment 1"
              className="w-full h-full object-cover"
              onClick={() => handleImageClick(0)}
            />
          </div>
          <div className="grid grid-rows-2 gap-1">
            <div className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={images[1]}
                alt="Moment 2"
                className="w-full h-full object-cover"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={images[2]}
                alt="Moment 3"
                className="w-full h-full object-cover"
                onClick={() => handleImageClick(2)}
              />
            </div>
          </div>
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Four images
  if (imageCount === 4) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mb-3">
          {images.slice(0, 4).map((image, index) => (
            <div key={index} className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={image}
                alt={`Moment ${index + 1}`}
                className="w-full h-32 object-cover"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Five images
  if (imageCount === 5) {
    return (
      <>
        <div className="rounded-lg overflow-hidden mb-3">
          <div className="grid grid-cols-2 gap-1 mb-1">
            {images.slice(0, 2).map((image, index) => (
              <div key={index} className="cursor-pointer hover:opacity-90 transition-opacity">
                <ImageWithPlaceholder
                  src={image}
                  alt={`Moment ${index + 1}`}
                  className="w-full h-32 object-cover"
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {images.slice(2, 5).map((image, index) => (
              <div key={index + 2} className="cursor-pointer hover:opacity-90 transition-opacity">
                <ImageWithPlaceholder
                  src={image}
                  alt={`Moment ${index + 3}`}
                  className="w-full h-24 object-cover"
                  onClick={() => handleImageClick(index + 2)}
                />
              </div>
            ))}
          </div>
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Six images
  if (imageCount === 6) {
    return (
      <>
        <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden mb-3">
          {images.slice(0, 6).map((image, index) => (
            <div key={index} className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={image}
                alt={`Moment ${index + 1}`}
                className="w-full h-24 object-cover"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Seven images
  if (imageCount === 7) {
    return (
      <>
        <div className="rounded-lg overflow-hidden mb-3">
          <div className="cursor-pointer hover:opacity-90 transition-opacity mb-1">
            <ImageWithPlaceholder
              src={images[0]}
              alt="Moment 1"
              className="w-full h-32 object-cover"
              onClick={() => handleImageClick(0)}
            />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {images.slice(1, 7).map((image, index) => (
              <div key={index + 1} className="cursor-pointer hover:opacity-90 transition-opacity">
                <ImageWithPlaceholder
                  src={image}
                  alt={`Moment ${index + 2}`}
                  className="w-full h-24 object-cover"
                  onClick={() => handleImageClick(index + 1)}
                />
              </div>
            ))}
          </div>
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Eight images
  if (imageCount === 8) {
    return (
      <>
        <div className="rounded-lg overflow-hidden mb-3">
          <div className="grid grid-cols-2 gap-1 mb-1">
            {images.slice(0, 2).map((image, index) => (
              <div key={index} className="cursor-pointer hover:opacity-90 transition-opacity">
                <ImageWithPlaceholder
                  src={image}
                  alt={`Moment ${index + 1}`}
                  className="w-full h-32 object-cover"
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {images.slice(2, 8).map((image, index) => (
              <div key={index + 2} className="cursor-pointer hover:opacity-90 transition-opacity">
                <ImageWithPlaceholder
                  src={image}
                  alt={`Moment ${index + 3}`}
                  className="w-full h-24 object-cover"
                  onClick={() => handleImageClick(index + 2)}
                />
              </div>
            ))}
          </div>
        </div>
        <ImageViewer
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // Nine or more images (show first 8, 9th shows "+N")
  const remainingCount = imageCount - 8;
  return (
    <>
      <div className="rounded-lg overflow-hidden mb-3">
        <div className="grid grid-cols-2 gap-1 mb-1">
          {images.slice(0, 2).map((image, index) => (
            <div key={index} className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={image}
                alt={`Moment ${index + 1}`}
                className="w-full h-32 object-cover"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {images.slice(2, 8).map((image, index) => (
            <div key={index + 2} className="cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={image}
                alt={`Moment ${index + 3}`}
                className="w-full h-24 object-cover"
                onClick={() => handleImageClick(index + 2)}
              />
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="relative cursor-pointer hover:opacity-90 transition-opacity">
              <ImageWithPlaceholder
                src={images[8]}
                alt="Moment 9"
                className="w-full h-24 object-cover"
                onClick={() => handleImageClick(8)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center pointer-events-none">
                <span className="text-white font-semibold text-lg">+{remainingCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
};

export default ImageGrid;