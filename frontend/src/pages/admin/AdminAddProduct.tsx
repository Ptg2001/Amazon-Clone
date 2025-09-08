import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import productAPI from '../../services/productAPI';

const AdminAddProduct = () => {
  const navigate = useNavigate();

  const { data: categoriesData } = useQuery(
    ['admin-add-product-categories'],
    () => productAPI.getCategories({ limit: 100 }),
    { staleTime: 10 * 60 * 1000 }
  );

  const categories = categoriesData?.data?.data?.categories || [];

  const [form, setForm] = useState({
    title: '',
    description: '',
    features: '',
    price: '',
    category: '',
    brand: '',
    model: '',
    sku: '',
    quantity: '',
    screenSize: '',
    resolution: '',
    refreshRate: '',
    aspectRatio: '',
    panelType: '',
    screenSurface: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    unit: 'in',
    attributes: {
      fabricType: '',
      origin: '',
      closureType: '',
      neckStyle: ''
    },
    attributesText: '',
    isActive: true,
    isFeatured: false,
    imageUrl: ''
  });
  const [variationsText, setVariationsText] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Parse generic attributes from freeform text: key: value per line
      const parsedAttributes: Record<string, string> = {};
      const lines = (form.attributesText || '').split('\n');
      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        const idx = line.indexOf(':');
        if (idx > -1) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          if (k && v) parsedAttributes[k] = v;
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        features: form.features
          ? form.features
              .split('\n')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        price: parseFloat(form.price),
        category: form.category,
        brand: form.brand,
        model: form.model,
        sku: form.sku.toUpperCase(),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        screenSize: form.screenSize,
        resolution: form.resolution,
        refreshRate: form.refreshRate,
        aspectRatio: form.aspectRatio,
        panelType: form.panelType,
        screenSurface: form.screenSurface,
        attributes: {
          ...parsedAttributes,
          ...Object.fromEntries(
            Object.entries(form.attributes as any).filter(([_, v]) => (v as string)?.trim?.()) as any
          )
        },
        dimensions: {
          length: form.length ? parseFloat(form.length) : undefined,
          width: form.width ? parseFloat(form.width) : undefined,
          height: form.height ? parseFloat(form.height) : undefined,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          unit: form.unit || 'in',
        },
        inventory: { quantity: parseInt(form.quantity || '0', 10), lowStockThreshold: 5 },
        images: imagesText
          ? imagesText.split('\n').map((u) => ({ url: u.trim() })).filter((i) => i.url && i.url.startsWith('http'))
          : (form.imageUrl ? [{ url: form.imageUrl }] : []),
        // variations in format: Name | option1, option2, option3
        variants: variationsText
          ? variationsText.split('\n').map((line) => {
              const l = line.trim();
              if (!l) return null as any;
              const [namePart, optsPart] = l.split('|');
              const name = (namePart || '').trim();
              const options = (optsPart || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              if (!name || options.length === 0) return null as any;
              return { name, options } as any;
            }).filter(Boolean)
          : []
      };
      await productAPI.createProduct(payload);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === form.category);
  const selectedCategoryName = selectedCategory?.name || '';
  const showDisplaySpecs = /Electronics|Computer|Laptop|Tablet|Display|Monitor|TV|Audio/i.test(selectedCategoryName);
  const showApparel = /(Women|Men|Fashion|Clothing|Apparel|Tops|Shirts|Dress|Blouse)/i.test(selectedCategoryName);

  // Department templates: suggested attributes and bullets
  const deptTemplates: Array<{ test: RegExp; attributes: string[]; bullets: string[] }> = [
    {
      test: /(Smartphone|Phone|Mobile|Cell|Accessories)/i,
      attributes: [
        'Operating System',
        'RAM Memory Installed Size',
        'CPU Model',
        'CPU Speed',
        'Memory Storage Capacity',
        'Screen Size',
        'Resolution',
        'Model Name',
        'Wireless Carrier',
        'Display',
        'Camera',
        'Battery',
        '5G/4G Bands',
        'eSIM Support'
      ],
      bullets: [
        'Carrier Compatibility: Unlocked for all major carriers',
        'Display: Super AMOLED/LCD, refresh rate, brightness, aspect ratio',
        'Camera: megapixels, apertures, focal lengths, features',
        'Battery: capacity (mAh), charging power (W)',
        'Bands: detailed LTE/5G bands list; eSIM support notes'
      ]
    },
    {
      test: /Home|Kitchen|Cookware|Appliance|Dining/i,
      attributes: ['Material', 'Special Feature', 'Capacity', 'Color'],
      bullets: [
        'Exceptional Nonstick Surface: …',
        'Durable and Eco-Friendly Material: …',
        'Dishwasher Safe & Oven Safe: …',
        'Versatile Cooking Options: …',
        'Even Heat Distribution: …',
      ],
    },
    {
      test: /(Beauty|Skincare|Hair|Cosmetics)/i,
      attributes: ['Skin Type', 'Active Ingredient', 'Scent', 'Volume'],
      bullets: ['Brightening effect …', 'Dermatologist tested …', 'Cruelty free …'],
    },
    {
      test: /(Books|Media)/i,
      attributes: ['Format', 'Pages', 'Language', 'Publisher'],
      bullets: ['Bestseller …', 'Great for …'],
    },
    {
      test: /(Automotive|Car|Motor)/i,
      attributes: ['Compatibility', 'Mount Type', 'Rotation', 'Installation'],
      bullets: ['Strong magnetic hold …', '360° rotation …'],
    },
    {
      test: /(Toys|Games|Lego|Building)/i,
      attributes: ['Pieces', 'Age Range', 'Difficulty', 'Display Size'],
      bullets: ['Collectible display model …', 'Detailed instructions …'],
    },
    {
      test: /(Grocery|Food|Oil|Beverage)/i,
      attributes: ['Volume', 'Type', 'Origin', 'Certification'],
      bullets: ['Cold-pressed …', 'Rich flavor …'],
    },
    {
      test: /(Pet|Dog|Cat)/i,
      attributes: ['Weight', 'Life Stage', 'Protein Source', 'Grain Free'],
      bullets: ['Complete nutrition …', 'Digestive health …'],
    },
  ];

  const matchedTemplate = deptTemplates.find((t) => t.test.test(selectedCategoryName));

  return (
    <>
      <Helmet>
        <title>Add Product - Admin - Amazon Clone</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Product</h1>

          <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" value={form.title} onChange={onChange} required className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input name="brand" value={form.brand} onChange={onChange} required className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input name="model" value={form.model} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input name="sku" value={form.sku} onChange={onChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} required rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input name="quantity" type="number" value={form.quantity} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={form.category} onChange={onChange} required className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">More Images (one URL per line)</label>
                <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder={`https://.../image1.jpg\nhttps://.../image2.jpg`} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (About this item)</label>
                <textarea name="features" value={form.features} onChange={onChange} placeholder={(matchedTemplate?.bullets || ['Bullet 1','Bullet 2','Bullet 3']).join('\n')} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>

            {/* Specs grid matching PDP (visible for Electronics / Displays) */}
            {showDisplaySpecs && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Specs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Size</label>
                  <input name="screenSize" value={form.screenSize} onChange={onChange} placeholder="27 Inches" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                  <input name="resolution" value={form.resolution} onChange={onChange} placeholder="FHD 1080p" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Rate</label>
                  <input name="refreshRate" value={form.refreshRate} onChange={onChange} placeholder="165Hz" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                  <input name="aspectRatio" value={form.aspectRatio} onChange={onChange} placeholder="16:9" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Panel Type</label>
                  <input name="panelType" value={form.panelType} onChange={onChange} placeholder="IPS" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Surface</label>
                  <input name="screenSurface" value={form.screenSurface} onChange={onChange} placeholder="Glossy / Matte" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
            </div>
            )}

            {/* Dimensions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Dimensions</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                  <input name="length" value={form.length} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <input name="width" value={form.width} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input name="height" value={form.height} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input name="weight" value={form.weight} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select name="unit" value={form.unit} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Apparel attributes (category-specific) */}
            {showApparel && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Apparel Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric type</label>
                  <input name="attributes.fabricType" value={(form as any).attributes?.fabricType} onChange={(e: any) => setForm((p) => ({ ...p, attributes: { ...p.attributes, fabricType: e.target.value } }))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input name="attributes.origin" value={(form as any).attributes?.origin} onChange={(e: any) => setForm((p) => ({ ...p, attributes: { ...p.attributes, origin: e.target.value } }))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closure type</label>
                  <input name="attributes.closureType" value={(form as any).attributes?.closureType} onChange={(e: any) => setForm((p) => ({ ...p, attributes: { ...p.attributes, closureType: e.target.value } }))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Neck style</label>
                  <input name="attributes.neckStyle" value={(form as any).attributes?.neckStyle} onChange={(e: any) => setForm((p) => ({ ...p, attributes: { ...p.attributes, neckStyle: e.target.value } }))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
            </div>
            )}

            {/* Generic attributes editor for any category */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Attributes</h2>
              <p className="text-xs text-gray-500 mb-2">Enter one per line as "Label: Value". Example: Capacity: 7.5 Liters</p>
              {matchedTemplate && (
                <div className="mb-2 text-xs text-gray-600">
                  <span className="font-medium">Suggested:</span> {matchedTemplate.attributes.join(', ')}
                </div>
              )}
              <textarea
                name="attributesText"
                value={(form as any).attributesText}
                onChange={onChange}
                placeholder={matchedTemplate ? matchedTemplate.attributes.map((a) => `${a}: …`).join('\n') : `Material: Aluminum, Ceramic\nSpecial Feature: Induction Compatible\nCapacity: 7.5 Liters`}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Variations editor */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Variations</h2>
              <p className="text-xs text-gray-500 mb-2">One per line as "Name | option1, option2, option3". Example: Color | Black, Titanium Black, Blue</p>
              <textarea
                value={variationsText}
                onChange={(e) => setVariationsText(e.target.value)}
                placeholder={`Color | Black, Blue, Titanium Black\nStorage | 128GB, 256GB, 512GB\nStyle | S25, S25 Edge, S25 Ultra\nPattern Name | Phone Only, Phone w/ Buds 3 Pro`}
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={onChange} />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => navigate('/admin/products')} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-amazon-orange text-white hover:bg-orange-600 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminAddProduct;


