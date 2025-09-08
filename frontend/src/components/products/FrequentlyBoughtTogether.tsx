import React from 'react';

type Item = { _id: string; title: string; price?: number; images?: { url: string }[] };

const FrequentlyBoughtTogether = ({ main, items = [] as Item[] }: { main: Item; items?: Item[] }) => {
  if (!main || !items.length) return null;
  const candidates = items.slice(0, 2);
  const total = [main, ...candidates].reduce((s, p) => s + (p.price || 0), 0);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently bought together</h3>
      <div className="flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-4">
          <img className="w-24 h-24 object-cover rounded" src={main.images?.[0]?.url || '/images/placeholder.jpg'} alt={main.title} />
          <span className="text-xl">+</span>
          {candidates.map((p, idx) => (
            <React.Fragment key={p._id}>
              <img className="w-24 h-24 object-cover rounded" src={p.images?.[0]?.url || '/images/placeholder.jpg'} alt={p.title} />
              {idx < candidates.length - 1 && <span className="text-xl">+</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="ml-auto min-w-[220px]">
          <div className="text-sm text-gray-700">Total price:</div>
          <div className="text-2xl font-semibold text-gray-900">${total.toFixed(2)}</div>
          <button className="mt-3 w-full bg-amazon-orange text-white rounded-md px-4 py-2 hover:bg-orange-600">Add all to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;


