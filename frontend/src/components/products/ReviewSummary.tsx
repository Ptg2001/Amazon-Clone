import React from 'react';

type Histogram = { rating: number; count: number }[];

const ReviewSummary = ({ average = 0, total = 0, histogram = [] as Histogram }: { average?: number; total?: number; histogram?: Histogram }) => {
  if (!total) return null;
  const rows = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: histogram.find((h) => h.rating === r)?.count || 0,
  }));
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-4xl font-bold text-gray-900">{average.toFixed(1)} <span className="text-yellow-500">★</span></div>
          <div className="text-sm text-gray-600">{total} ratings</div>
        </div>
        <div className="flex-1 space-y-2 min-w-[240px]">
          {rows.map((r) => {
            const pct = Math.round((r.count / max) * 100);
            return (
              <div key={r.rating} className="flex items-center gap-3">
                <span className="w-10 text-sm text-gray-700">{r.rating} star</span>
                <div className="flex-1 h-3 bg-gray-200 rounded">
                  <div className="h-3 bg-yellow-400 rounded" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-right text-sm text-gray-600">{r.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;


