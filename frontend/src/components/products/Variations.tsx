import React from 'react';

type Variation = { name: string; options: Array<string | { label: string; value: string; imageUrl?: string }> };

const Variations = ({ variations = [] as Variation[], selected = {} as Record<string, string>, onChange }: { variations?: Variation[]; selected?: Record<string, string>; onChange?: (name: string, value: string) => void }) => {
  if (!variations.length) return null;

  const parseColorFromText = (text: string): string | undefined => {
    const t = (text || '').toLowerCase();
    const map: Record<string, string> = {
      black: '#111827',
      graphite: '#111827',
      midnight: '#111827',
      gray: '#6b7280',
      grey: '#6b7280',
      silver: '#9ca3af',
      white: '#f3f4f6',
      starlight: '#f3f4f6',
      blue: '#2563eb',
      navy: '#1e3a8a',
      green: '#16a34a',
      red: '#dc2626',
      pink: '#ec4899',
      purple: '#7c3aed',
      gold: '#d6b36a',
      desert: '#c2a878',
      natural: '#b8b8aa',
      titanium: '#b8b8aa',
      yellow: '#f59e0b',
      orange: '#f97316',
      brown: '#92400e',
      cream: '#f5f5dc',
      beige: '#f5f5dc',
      blueish: '#2563eb',
      bluish: '#2563eb',
      sky: '#38bdf8',
      cyan: '#06b6d4',
      teal: '#14b8a6',
      lime: '#84cc16',
      violet: '#8b5cf6',
      indigo: '#6366f1',
      maroon: '#7f1d1d',
      magenta: '#be185d',
      charcoal: '#374151',
      sand: '#e7d8b1',
    };
    for (const key of Object.keys(map)) {
      if (t.includes(key)) return map[key];
    }
    // Try extracting hex like #RRGGBB
    const m = t.match(/#([0-9a-f]{6})/i);
    if (m) return `#${m[1]}`;
    // Try exact CSS named color using canvas to resolve to rgb
    if (typeof window !== 'undefined') {
      const words = (text || '').split(/\s|\//g).filter(Boolean);
      const candidates = [t, ...words.map((w) => w.toLowerCase())];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        for (const c of candidates) {
          try {
            (ctx as any).fillStyle = c;
            const resolved = (ctx as any).fillStyle as string;
            if (resolved && resolved !== '#000000' || c === 'black') {
              // resolved might be rgb(...) or #rrggbb
              if (resolved.startsWith('rgb')) {
                return resolved;
              }
              return resolved; // hex
            }
          } catch {}
        }
      }
    }
    return undefined;
  };

  const toRgba = (color: string, alpha: number) => {
    if (!color) return `rgba(0,0,0,${alpha})`;
    if (color.startsWith('rgb')) {
      const nums = color.replace(/rgba?|\(|\)|\s/g, '').split(',').slice(0, 3).map((n) => parseInt(n, 10));
      const [r, g, b] = nums.length === 3 ? nums : [0, 0, 0];
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (m) {
      const r = parseInt(m[1], 16);
      const g = parseInt(m[2], 16);
      const b = parseInt(m[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Fallback: try canvas
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          (ctx as any).fillStyle = color;
          const resolved = (ctx as any).fillStyle as string;
          return toRgba(resolved, alpha);
        } catch {}
      }
    }
    return `rgba(0,0,0,${alpha})`;
  };

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
              const inferredColor = parseColorFromText(label);
              return (
                <button
                  key={value}
                  onClick={() => onChange && onChange(v.name, value)}
                  className={`${
                    isSizeLike
                      ? 'min-w-[3rem] h-10 px-3'
                      : 'h-10 px-4'
                  } inline-flex items-center justify-center rounded-md border text-sm transition-colors ${
                    isSelected && inferredColor
                      ? 'border-gray-300'
                      : isSelected
                        ? 'border-amazon-orange ring-2 ring-amazon-orange/30 bg-orange-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  style={isSelected && inferredColor ? {
                    borderColor: inferredColor,
                    boxShadow: `0 0 0 2px ${toRgba(inferredColor, 0.3)}`,
                    backgroundColor: toRgba(inferredColor, 0.08),
                  } : undefined}
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


