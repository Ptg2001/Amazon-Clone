import React from 'react';

type Specs = Record<string, string | number | boolean | null | undefined> | Array<{ label: string; value: string }>;

const normalizeSpecs = (specs: Specs) => {
  if (Array.isArray(specs)) return specs.filter((s) => s && s.label);
  if (specs && typeof specs === 'object') {
    return Object.entries(specs)
      .filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== '')
      .map(([k, v]) => ({ label: k, value: String(v) }));
  }
  return [];
};

const ProductSpecs = ({ specs }: { specs: Specs }) => {
  const rows = normalizeSpecs(specs);
  if (!rows.length) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Technical Details</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={`${row.label}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <th className="w-1/3 text-left px-6 py-3 text-sm font-medium text-gray-600">{row.label}</th>
                <td className="px-6 py-3 text-sm text-gray-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductSpecs;


