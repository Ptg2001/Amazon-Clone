import React from 'react';

type ProductLite = {
  _id: string;
  title: string;
  price?: number;
  images?: { url: string }[];
  ratings?: { average?: number };
  brand?: string;
  features?: string[];
};

const ComparisonTable = ({ products = [] as ProductLite[] }: { products?: ProductLite[] }) => {
  const cols = products.slice(0, 5);
  if (!cols.length) return null;

  const headers = [
    { key: 'image', label: '' },
    { key: 'title', label: 'Product' },
    { key: 'price', label: 'Price' },
    { key: 'ratings', label: 'Rating' },
    { key: 'brand', label: 'Brand' },
    { key: 'feature1', label: 'Top Feature' },
  ];

  return (
    <div className="mt-10 bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Compare with similar items</h3>
      </div>
      <table className="min-w-[700px] w-full text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h.key} className="text-left px-4 py-3 text-gray-600 font-medium">{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cols.map((p) => (
            <tr key={p._id} className="border-t border-gray-100">
              <td className="px-4 py-3">
                <img src={p.images?.[0]?.url || '/images/placeholder.jpg'} alt={p.title} className="w-16 h-16 object-cover rounded" />
              </td>
              <td className="px-4 py-3 max-w-xs">
                <div className="font-medium text-gray-900 line-clamp-2">{p.title}</div>
              </td>
              <td className="px-4 py-3 text-gray-900">{p.price ? `$${p.price.toFixed(2)}` : '-'}</td>
              <td className="px-4 py-3 text-gray-700">{p.ratings?.average ? `${p.ratings.average}★` : '-'}</td>
              <td className="px-4 py-3 text-gray-700">{p.brand || '-'}</td>
              <td className="px-4 py-3 text-gray-700">{p.features?.[0] || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;


