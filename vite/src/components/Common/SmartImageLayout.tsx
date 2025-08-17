import React from 'react';
import ImageWithPlaceholder from './ImageWithPlaceholder';

interface SmartImageLayoutProps {
  images: string[];
  onImageClick?: (index: number) => void;
  className?: string;
}

const SmartImageLayout: React.FC<SmartImageLayoutProps> = ({ 
  images, 
  onImageClick, 
  className = '' 
}) => {
  const getLayoutConfig = (count: number) => {
    switch (count) {
      case 1:
        return {
          grid: 'grid-cols-1',
          height: 'h-64',
          aspect: 'aspect-[4/3]'
        };
      case 2:
        return {
          grid: 'grid-cols-2',
          height: 'h-48',
          aspect: 'aspect-square'
        };
      case 3:
        return {
          grid: 'grid-cols-2 grid-rows-2',
          height: 'h-64',
          aspect: 'aspect-square',
          special: true
        };
      case 4:
        return {
          grid: 'grid-cols-2 grid-rows-2',
          height: 'h-64',
          aspect: 'aspect-square'
        };
      case 5:
        return {
          grid: 'grid-cols-3 grid-rows-2',
          height: 'h-64',
          aspect: 'aspect-square',
          special: true
        };
      case 6:
        return {
          grid: 'grid-cols-3 grid-rows-2',
          height: 'h-64',
          aspect: 'aspect-square'
        };
      case 7:
        return {
          grid: 'grid-cols-4 grid-rows-2',
          height: 'h-64',
          aspect: 'aspect-square',
          special: true
        };
      case 8:
        return {
          grid: 'grid-cols-4 grid-rows-2',
          height: 'h-64',
          aspect: 'aspect-square'
        };
      case 9:
        return {
          grid: 'grid-cols-3 grid-rows-3',
          height: 'h-72',
          aspect: 'aspect-square'
        };
      default:
        return {
          grid: 'grid-cols-3',
          height: 'h-64',
          aspect: 'aspect-square'
        };
    }
  };

  const config = getLayoutConfig(images.length);
  const remainingImages = images.length > 9 ? images.length - 9 : 0;

  const renderImages = () => {
    const displayImages = images.slice(0, 9);
    
    if (config.special) {
      switch (images.length) {
        case 3:
          return (
            <>
              <div className="col-span-2 row-span-2">
                <SmartImage
                  src={displayImages[0]}
                  index={0}
                  onClick={onImageClick}
                  aspect="aspect-[4/3]"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <SmartImage
                  src={displayImages[1]}
                  index={1}
                  onClick={onImageClick}
                  aspect="aspect-square"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <SmartImage
                  src={displayImages[2]}
                  index={2}
                  onClick={onImageClick}
                  aspect="aspect-square"
                />
              </div>
            </>
          );
        
        case 5:
          return (
            <>
              <div className="col-span-2 row-span-2">
                <SmartImage
                  src={displayImages[0]}
                  index={0}
                  onClick={onImageClick}
                  aspect="aspect-[4/3]"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <SmartImage
                  src={displayImages[1]}
                  index={1}
                  onClick={onImageClick}
                  aspect="aspect-square"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <SmartImage
                  src={displayImages[2]}
                  index={2}
                  onClick={onImageClick}
                  aspect="aspect-square"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <SmartImage
                  src={displayImages[3]}
                  index={3}
                  onClick={onImageClick}
                  aspect="aspect-square"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <SmartImage
                  src={displayImages[4]}
                  index={4}
                  onClick={onImageClick}
                  aspect="aspect-square"
                />
              </div>
            </>
          );
        
        case 7:
          return (
            <>
              <div className="col-span-2 row-span-2">
                <SmartImage
                  src={displayImages[0]}
                  index={0}
                  onClick={onImageClick}
                  aspect="aspect-[4/3]"
                />
              </div>
              <div className="col-span-2 row-span-1">
                <SmartImage
                  src={displayImages[1]}
                  index={1}
                  onClick={onImageClick}
                  aspect="aspect-[4/3]"
                />
              </div>
              {displayImages.slice(2, 5).map((image, index) => (
                <div key={index} className="col-span-1 row-span-1">
                  <SmartImage
                    src={image}
                    index={index + 2}
                    onClick={onImageClick}
                    aspect="aspect-square"
                  />
                </div>
              ))}
              <div className="col-span-2 row-span-1">
                <SmartImage
                  src={displayImages[5]}
                  index={5}
                  onClick={onImageClick}
                  aspect="aspect-[4/3]"
                />
              </div>
              <div className="col-span-2 row-span-1">
                <SmartImage
                  src={displayImages[6]}
                  index={6}
                  onClick={onImageClick}
                  aspect="aspect-[4/3]"
                />
              </div>
            </>
          );
      }
    }

    return displayImages.map((image, index) => (
      <div key={index} className={config.aspect}>
        <SmartImage
          src={image}
          index={index}
          onClick={onImageClick}
          aspect={config.aspect}
        />
      </div>
    ));
  };

  return (
    <div className={`grid ${config.grid} gap-1 ${config.height} ${className}`}>
      {renderImages()}
      {remainingImages > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          +{remainingImages} more
        </div>
      )}
    </div>
  );
};

interface SmartImageProps {
  src: string;
  index: number;
  onClick?: (index: number) => void;
  aspect?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({ 
  src, 
  index, 
  onClick, 
  aspect = 'aspect-square' 
}) => {
  return (
    <div 
      className={`${aspect} w-full h-full overflow-hidden rounded-lg cursor-pointer group relative`}
      onClick={() => onClick?.(index)}
    >
      <ImageWithPlaceholder
        src={src}
        alt={`Image ${index + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
    </div>
  );
};

export default SmartImageLayout;