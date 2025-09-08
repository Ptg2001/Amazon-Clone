import React, { useState } from 'react';

const ReviewFilters = ({ onSearch, onFilterRating, rating }: { onSearch?: (q: string) => void; onFilterRating?: (r: number | null) => void; rating?: number | null }) => {
  const [search, setSearch] = useState('');
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {[5,4,3,2,1].map((r) => (
          <button
            key={r}
            onClick={() => onFilterRating && onFilterRating(rating === r ? null : r)}
            className={`text-sm rounded-full border px-3 py-1 ${rating === r ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {r} star
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
          />
          <button onClick={() => onSearch && onSearch(search)} className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-200">Search</button>
          {(rating || search) && (
            <button onClick={() => { onFilterRating && onFilterRating(null); setSearch(''); onSearch && onSearch(''); }} className="text-sm text-blue-700 underline">Clear</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;


