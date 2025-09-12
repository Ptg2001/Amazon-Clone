import React, { useState } from 'react';
import contentAPI from '../../services/contentAPI';

type Slide = {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
};

const defaultSlides: Slide[] = [
  { title: 'New Arrivals', subtitle: 'Discover the latest products', description: 'Shop the newest collection of electronics, fashion, and home goods', image: '', link: '/search?q=new+arrivals', buttonText: 'Shop Now' },
];

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [saving, setSaving] = useState(false);

  const addSlide = () => setSlides((s) => [...s, { title: '', image: '' } as Slide]);
  const removeSlide = (idx: number) => setSlides((s) => s.filter((_, i) => i !== idx));
  const update = (idx: number, field: keyof Slide, value: string) => {
    setSlides((s) => s.map((sl, i) => (i === idx ? { ...sl, [field]: value } : sl)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const normalized = slides.map((s, i) => ({ id: i + 1, buttonText: s.buttonText || 'Shop Now', link: s.link || '/', ...s }));
      await contentAPI.updateHeroSlides(normalized as any);
      alert('Slides saved');
    } catch (e) {
      alert('Failed to save slides');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Hero Slides</h1>
      <div className="space-y-6">
        {slides.map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-700">Title</span>
                <input value={s.title} onChange={(e) => update(idx, 'title', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Subtitle</span>
                <input value={s.subtitle || ''} onChange={(e) => update(idx, 'subtitle', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-700">Description</span>
                <input value={s.description || ''} onChange={(e) => update(idx, 'description', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-gray-700">Image URL</span>
                <input value={s.image} onChange={(e) => update(idx, 'image', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="https://..." />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">CTA Link</span>
                <input value={s.link || ''} onChange={(e) => update(idx, 'link', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">CTA Text</span>
                <input value={s.buttonText || ''} onChange={(e) => update(idx, 'buttonText', e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">Preview:</div>
              <button onClick={() => removeSlide(idx)} className="text-red-600 text-sm hover:underline">Remove</button>
            </div>
            <div className="h-40 bg-gray-100 rounded overflow-hidden bg-center bg-cover" style={{ backgroundImage: `url(${s.image})` }} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={addSlide} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Add Slide</button>
        <button onClick={save} disabled={saving} className="px-5 py-2 bg-amazon-orange text-white rounded hover:bg-orange-600 disabled:opacity-60">{saving ? 'Saving...' : 'Save Slides'}</button>
      </div>
    </div>
  );
};

export default AdminSlides;


