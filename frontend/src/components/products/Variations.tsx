import React from 'react';

type Variation = { name: string; options: Array<string | { label: string; value: string; imageUrl?: string }> };

const Variations = ({ variations = [] as Variation[], selected = {} as Record<string, string>, onChange }: { variations?: Variation[]; selected?: Record<string, string>; onChange?: (name: string, value: string) => void }) => {
  if (!variations.length) return null;

  return (
    <div className="space-y-4">
      {variations.map((v) => (
        <div key={v.name}>
          <div className="text-sm font-medium text-gray-900 mb-1">{v.name}</div>
          <div className="flex flex-wrap gap-2">
            {v.options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : (opt.label || opt.value);
              const imageUrl = typeof opt === 'string' ? undefined : opt.imageUrl;
              const isSelected = selected?.[v.name] === value;
              const isSizeLike = /size|inch|cm|mm|gb|tb|hz/i.test(v.name);
              return (
                <button
                  key={value}
                  onClick={() => onChange && onChange(v.name, value)}
                  className={`${
                    isSizeLike
                      ? 'min-w-[3rem] h-10 px-3'
                      : 'h-10 px-4'
                  } inline-flex items-center justify-center rounded-md border text-sm transition-colors ${
                    isSelected
                      ? 'border-amazon-orange ring-2 ring-amazon-orange/30 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={label}
                      className="w-6 h-6 object-cover rounded mr-2"
                    />
                  )}
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Variations;


