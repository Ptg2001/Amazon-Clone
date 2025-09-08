import React from 'react';

type Block = { image: { url: string; alt?: string }; title?: string; text?: string };

const FromTheBrand = ({ brand, blocks = [] as Block[] }: { brand?: string; blocks?: Block[] }) => {
  if (!blocks.length) return null;
  return (
    <div className="mt-10 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">From the brand {brand ? `· ${brand}` : ''}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((b, idx) => (
          <article key={idx} className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <img src={b.image.url} alt={b.image.alt || b.title || 'From the brand'} className="w-full h-48 object-cover" />
            <div className="p-3">
              {b.title && <h4 className="font-medium text-gray-900">{b.title}</h4>}
              {b.text && <p className="text-sm text-gray-700 mt-1">{b.text}</p>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default FromTheBrand;


