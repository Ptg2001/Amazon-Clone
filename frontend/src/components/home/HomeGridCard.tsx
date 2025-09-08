import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const HomeGridCard = ({ title, image, imageAlt, imageLink, items = [], cta }) => {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden h-full">
      <div className="p-4 flex flex-col h-full">
        {title && (
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {title}
          </h3>
        )}

        {image && (
          <Link to={imageLink || '#'} className="block mb-4">
            <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
              <LazyLoadImage
                src={image}
                alt={imageAlt || title}
                effect="blur"
                className="w-full h-full object-cover"
                placeholderSrc="/images/hero-placeholder.jpg"
              />
            </div>
          </Link>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 flex-1">
            {items.slice(0, 4).map((item, idx) => (
              <Link key={idx} to={item.link || '#'} className="group">
                <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                  {item.image && (
                    <LazyLoadImage
                      src={item.image}
                      alt={item.label}
                      effect="blur"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      placeholderSrc="/images/category-placeholder.jpg"
                    />
                  )}
                </div>
                <div className="text-sm text-gray-700 group-hover:text-amazon-orange">
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        )}

        {cta && (
          <div className="mt-4">
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


