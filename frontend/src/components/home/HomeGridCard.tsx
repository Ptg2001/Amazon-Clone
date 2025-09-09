import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const HomeGridCard = ({ title, image, imageAlt, imageLink, items = [], cta }) => {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden h-full">
      <div className="p-4 flex flex-col h-full">
        {title && (
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
        )}

        {/* Content area grows to fill, keeping CTA at bottom */}
        <div className="flex-1 flex flex-col">
          {image && (
            <Link to={imageLink || '#'} className="block mb-3">
              <div className="bg-gray-50 rounded overflow-hidden flex items-center justify-center" style={{ height: 160 }}>
                <LazyLoadImage
                  src={image}
                  alt={imageAlt || title}
                  effect="blur"
                  className="w-full h-full object-contain p-2"
                  placeholderSrc="/images/hero-placeholder.jpg"
                />
              </div>
            </Link>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {items.slice(0, 4).map((item, idx) => (
                <Link key={idx} to={item.link || '#'} className="group">
                  <div className="bg-gray-50 rounded overflow-hidden mb-2 flex items-center justify-center" style={{ height: 72 }}>
                    {item.image && (
                      <LazyLoadImage
                        src={item.image}
                        alt={item.label}
                        effect="blur"
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                        placeholderSrc="/images/category-placeholder.jpg"
                      />
                    )}
                  </div>
                  <div className="text-sm text-gray-700 group-hover:text-amazon-orange whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Spacer to push CTA down uniformly */}
          <div className="flex-1" />
        </div>

        {cta && (
          <div className="pt-2">
            <Link to={cta.link} className="text-sm text-amazon-orange hover:underline">
              {cta.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeGridCard;


