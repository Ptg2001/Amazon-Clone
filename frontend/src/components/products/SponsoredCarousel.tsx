import React from 'react';
import { Link } from 'react-router-dom';
import countryService from '../../services/countryService';

type Item = { _id: string; title: string; sponsored?: boolean; images?: { url: string }[]; price?: number };

const SponsoredCarousel = ({ items = [] as Item[] }: { items?: Item[] }) => {
  if (!items.length) return null;

  return (
    <div className="mt-10 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Sponsored products related to this item</h3>
      </div>
      <div className="grid grid-flow-col auto-cols-[180px] gap-4 overflow-x-auto">
        {items.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="group border border-gray-200 rounded-md p-3 hover:shadow-sm">
            <div className="aspect-square w-full overflow-hidden rounded bg-white">
              <img src={p.images?.[0]?.url || '/images/placeholder.jpg'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="mt-2 text-xs text-gray-500">Sponsored</div>
            <div className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">{p.title}</div>
            {p.price != null && <div className="mt-1 text-amazon-orange font-semibold">{countryService.formatLocalCurrency(p.price)}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SponsoredCarousel;


