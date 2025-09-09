import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';

const HorizontalProductCarousel = ({ title, products = [], viewAllLink }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-6">
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-sm text-amazon-orange hover:underline">See more</Link>
          )}
        </div>
        <div className="px-4 sm:px-6 lg:px-8 pb-4 overflow-x-auto snap-x snap-mandatory">
          <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] sm:auto-cols-[minmax(220px,1fr)] md:auto-cols-[minmax(240px,1fr)] gap-3 sm:gap-4">
            {products.map((p) => (
              <div key={p._id} className="snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductCarousel;


