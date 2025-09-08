import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

type ImageItem = { url: string; alt?: string };

const ProductImageGallery = ({ images = [], title = 'Product image' }: { images: ImageItem[]; title?: string }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images?.[selectedIndex];

  return (
    <div className="w-full">
      <div className="flex gap-3">
        {/* Thumbnails (vertical) */}
        {images && images.length > 0 && (
          <div className="flex flex-col gap-2 w-16 sm:w-20">
            {images.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Select image ${idx + 1}`}
                className={`relative w-full aspect-square rounded-md overflow-hidden border ${
                  idx === selectedIndex ? 'border-amazon-orange ring-1 ring-amazon-orange' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LazyLoadImage
                  src={img.url}
                  alt={img.alt || `${title} ${idx + 1}`}
                  effect="blur"
                  className="w-full h-full object-cover"
                  placeholderSrc="/images/placeholder.jpg"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-square w-full bg-white group">
            <LazyLoadImage
              src={selectedImage?.url || '/images/placeholder.jpg'}
              alt={selectedImage?.alt || title}
              effect="blur"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              placeholderSrc="/images/placeholder.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;


