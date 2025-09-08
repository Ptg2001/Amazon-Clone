import React from 'react';

const ProductVideo = ({ youtubeId }: { youtubeId?: string }) => {
  if (!youtubeId) return null;
  const src = `https://www.youtube.com/embed/${youtubeId}`;
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Product Video</h3>
      </div>
      <div className="aspect-video w-full">
        <iframe
          src={src}
          title="Product video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ProductVideo;


