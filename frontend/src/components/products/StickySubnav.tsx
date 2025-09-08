import React, { useEffect, useState } from 'react';

type Item = { id: string; label: string };

const StickySubnav = ({ items = [] as Item[] }: { items?: Item[] }) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] }
    );

    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!items.length) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav className="flex gap-4 overflow-x-auto no-x-scrollbar">
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => handleClick(i.id)}
              className={`py-3 text-sm whitespace-nowrap border-b-2 -mb-px ${
                active === i.id ? 'border-amazon-orange text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {i.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default StickySubnav;


