import React from 'react';
import { Link } from 'react-router-dom';

type Crumb = { label: string; href?: string };

const Breadcrumbs = ({ items = [] as Crumb[] }: { items?: Crumb[] }) => {
  if (!items.length) return null;
  return (
    <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-x-2">
        {items.map((c, idx) => (
          <li key={`${c.label}-${idx}`} className="flex items-center">
            {idx > 0 && <span className="mx-2 text-gray-400">/</span>}
            {c.href ? (
              <Link to={c.href} className="hover:text-amazon-orange">{c.label}</Link>
            ) : (
              <span className="text-gray-800 font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;


