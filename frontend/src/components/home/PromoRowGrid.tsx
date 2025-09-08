import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const PromoCard = ({ title, subtitle, cta, image, to }) => (
  <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden h-full">
    <div className="p-4 flex flex-col h-full">
      {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-700 mb-4">{subtitle}</p>}
      {image && (
        <Link to={to || '#'} className="block">
          <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
            <LazyLoadImage src={image} alt={title} effect="blur" className="w-full h-full object-cover" />
          </div>
        </Link>
      )}
      {cta && (
        <div className="mt-4 mt-auto">
          <Link to={cta.to} className="text-sm text-amazon-orange hover:underline">{cta.label}</Link>
        </div>
      )}
    </div>
  </div>
);

const PromoRowGrid = ({ cards = [] }) => {
  if (!cards.length) return null;
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c, idx) => (
          <PromoCard key={idx} {...c} />
        ))}
      </div>
    </section>
  );
};

export default PromoRowGrid;


