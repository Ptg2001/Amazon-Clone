import React from 'react';

type APlusBlock = {
  title?: string;
  subtitle?: string;
  text?: string;
  image?: { url: string; alt?: string };
  layout?: 'left-image' | 'right-image' | 'full';
};

const ProductAPlus = ({ blocks = [] as APlusBlock[] }: { blocks?: APlusBlock[] }) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="mt-8 space-y-8">
      {blocks.map((b, idx) => {
        const layout = b.layout || 'left-image';
        const hasImage = Boolean(b.image?.url);
        return (
          <section key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {layout === 'full' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {hasImage && (
                  <img src={b.image!.url} alt={b.image!.alt || b.title || 'A+ image'} className="w-full h-full object-cover" />
                )}
                <div className="p-6">
                  {b.title && <h3 className="text-xl font-semibold mb-2">{b.title}</h3>}
                  {b.subtitle && <p className="text-amazon-orange font-medium mb-2">{b.subtitle}</p>}
                  {b.text && <p className="text-gray-700 leading-relaxed">{b.text}</p>}
                </div>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-0`}>
                {layout === 'left-image' && hasImage && (
                  <img src={b.image!.url} alt={b.image!.alt || b.title || 'A+ image'} className="w-full h-full object-cover" />
                )}
                <div className="p-6">
                  {b.title && <h3 className="text-xl font-semibold mb-2">{b.title}</h3>}
                  {b.subtitle && <p className="text-amazon-orange font-medium mb-2">{b.subtitle}</p>}
                  {b.text && <p className="text-gray-700 leading-relaxed">{b.text}</p>}
                </div>
                {layout === 'right-image' && hasImage && (
                  <img src={b.image!.url} alt={b.image!.alt || b.title || 'A+ image'} className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ProductAPlus;


