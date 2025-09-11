import React from 'react';
import { Link } from 'react-router-dom';
import countryService from '../../services/countryService';

type Item = { _id: string; title: string; images?: { url: string }[]; price?: number };

const RecentlyViewed = ({ items = [] as Item[] }: { items?: Item[] }) => {
  if (!items.length) return null;

  const formatPrice = (price?: number) =>
    typeof price === 'number' ? countryService.formatLocalCurrency(price) : '';

  return (
    <div className="mt-10 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Your recently viewed items</h3>
      <div className="grid grid-flow-col auto-cols-[200px] gap-4 overflow-x-auto">
        {items.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="group border border-gray-200 rounded-md p-3 hover:shadow-sm bg-white">
            <div className="aspect-[4/3] w-full overflow-hidden rounded bg-white flex items-center justify-center">
              <img src={p.images?.[0]?.url || '/images/placeholder.jpg'} alt={p.title} className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform" />
            </div>
            <div className="mt-2 min-h-[40px]">
              <div className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis" title={p.title}>{p.title}</div>
            </div>
            {p.price != null && (
              <div className="mt-1 text-amazon-orange font-semibold">{formatPrice(p.price)}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;


