import React, { useMemo, useRef, useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

type ImageItem = { url: string; alt?: string };

const ProductImageGallery = ({ images = [], title = 'Product image', color, colors = [] }: { images: ImageItem[]; title?: string; color?: string; colors?: string[] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showFullView, setShowFullView] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [lensPosition, setLensPosition] = useState({ left: 0, top: 0 });
  const [imageBox, setImageBox] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [placeLeft, setPlaceLeft] = useState(false);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number }>({ width: 720, height: 540 });

  const selectedImage = images?.[selectedIndex];
  const zoomFactor = 1.25; // slight extra zoom for more detail
  // Lens side equals half of the displayed image's shorter side (fallback to container)
  const baseShortSide = Math.min(
    imageBox.width || (containerSize.width || 0),
    imageBox.height || (containerSize.height || 0)
  );
  const lensSidePx = Math.max(80, Math.floor(baseShortSide / 2));
  const lensWidthPx = lensSidePx;
  const lensHeightPx = lensSidePx;
  // Fixed preview panel size to keep mapping stable (dynamically constrained)
  const previewWidthPx = previewSize.width;
  const previewHeightPx = previewSize.height; // 4:3 panel

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const halfW = lensWidthPx / 2;
    const halfH = lensHeightPx / 2;
    // Limit within displayed image box
    const minX = imageBox.left + halfW;
    const maxX = imageBox.left + Math.max(0, imageBox.width - halfW);
    const minY = imageBox.top + halfH;
    const maxY = imageBox.top + Math.max(0, imageBox.height - halfH);
    const clampedX = Math.min(Math.max(minX, rawX), maxX);
    const clampedY = Math.min(Math.max(minY, rawY), maxY);
    setCursor({ x: clampedX / rect.width, y: clampedY / rect.height });
    setLensPosition({ left: clampedX - halfW, top: clampedY - halfH });
  };

  const updatePreviewPlacement = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const gap = 16;
    const spaceRight = viewportWidth - rect.right - gap;
    const spaceLeft = rect.left - gap;
    const shouldPlaceLeft = spaceRight < 360 && spaceLeft > spaceRight;
    setPlaceLeft(!!shouldPlaceLeft);
    const availableW = Math.max(300, Math.min(840, Math.floor(shouldPlaceLeft ? spaceLeft : spaceRight)));
    const maxHeight = Math.max(240, viewportHeight - gap * 2);
    // Keep 4:3 while respecting both width and height constraints
    let width = isFinite(availableW) && availableW > 0 ? availableW : 720;
    let height = Math.floor((width * 3) / 4);
    if (height > maxHeight) {
      height = Math.floor(maxHeight);
      width = Math.floor((height * 4) / 3);
    }
    setPreviewSize({ width, height });
  };

  const lensStyle = useMemo(() => {
    return {
      width: `${lensWidthPx}px`,
      height: `${lensHeightPx}px`,
      left: `${lensPosition.left}px`,
      top: `${lensPosition.top}px`,
    } as React.CSSProperties;
  }, [lensWidthPx, lensHeightPx, lensPosition]);

  // Close full view with ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFullView(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Track container size for precise mapping
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const r = el.getBoundingClientRect();
      setContainerSize({ width: Math.floor(r.width), height: Math.floor(r.height) });
      const imgEl = el.querySelector('img');
      if (imgEl) {
        const ir = imgEl.getBoundingClientRect();
        setImageBox({
          left: Math.floor(ir.left - r.left),
          top: Math.floor(ir.top - r.top),
          width: Math.floor(ir.width),
          height: Math.floor(ir.height),
        });
      }
    };
    update();
    // Re-measure after image load and slight delay for layout
    const imgEl = el.querySelector('img');
    if (imgEl) {
      imgEl.addEventListener('load', update);
      setTimeout(update, 50);
    }
    const RO: any = (window as any).ResizeObserver;
    const ro = RO ? new RO(update) : undefined;
    if (ro) ro.observe(el);
    const onResize = () => { update(); updatePreviewPlacement(); };
    window.addEventListener('resize', onResize);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      if (imgEl) imgEl.removeEventListener('load', update);
    };
  }, [selectedIndex, images]);

  return (
    <div className="w-full">
      <div className="flex gap-3 relative">
        {/* Thumbnails: horizontal on mobile, vertical on md+ */}
        {images && images.length > 0 && (
          <div className="flex md:flex-col gap-2 w-full md:w-14 md:sm:w-16 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0">
            {images.map((img, idx) => (
              <button
                key={`${img.url}-${idx}`}
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Select image ${idx + 1}`}
                className={`relative md:w-full w-20 h-20 md:h-auto md:aspect-square flex-shrink-0 rounded-md overflow-hidden border ${
                  idx === selectedIndex ? 'border-amazon-orange ring-1 ring-amazon-orange' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LazyLoadImage
                  src={img.url}
                  alt={img.alt || `${title} ${idx + 1}`}
                  effect="blur"
                  className="w-full h-full object-cover"
                  placeholderSrc="/images/placeholder.jpg"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg relative overflow-visible">
          <div
            ref={containerRef}
            className="aspect-[4/3] w-full bg-white group relative"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <LazyLoadImage
              src={selectedImage?.url || '/images/placeholder.jpg'}
              alt={selectedImage?.alt || title}
              effect="blur"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              placeholderSrc="/images/placeholder.jpg"
            />
            {isZooming && (
              <>
                {/* Lens */}
                <div
                  className="absolute pointer-events-none border border-amazon-orange/70 bg-amazon-orange/10 rounded-sm"
                  style={lensStyle}
                />
                {/* Right Preview */}
                <div
                  className={`hidden lg:block absolute top-0 z-30 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md ${placeLeft ? 'right-full mr-4' : 'left-full ml-4'}`}
                  aria-hidden
                  style={{
                    width: `${previewWidthPx}px`,
                    height: `${previewHeightPx}px`,
                    backgroundImage: `url(${selectedImage?.url || '/images/placeholder.jpg'})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${Math.max(1, imageBox.width * (previewWidthPx / lensWidthPx) * zoomFactor)}px ${Math.max(1, imageBox.height * (previewHeightPx / lensHeightPx) * zoomFactor)}px`,
                    backgroundPosition: `${-Math.min((lensPosition.left - imageBox.left) * (previewWidthPx / lensWidthPx) * zoomFactor, Math.max(0, imageBox.width * (previewWidthPx / lensWidthPx) * zoomFactor - previewWidthPx) + 2)}px ${-Math.min((lensPosition.top - imageBox.top) * (previewHeightPx / lensHeightPx) * zoomFactor, Math.max(0, imageBox.height * (previewHeightPx / lensHeightPx) * zoomFactor - previewHeightPx) + 2)}px`,
                  }}
                />
              </>
            )}
          </div>
          {/* Full view link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowFullView(true)}
              className="text-amazon-blue hover:underline text-sm"
            >
              Click to see full view
            </button>
          </div>
        </div>
      </div>

      {/* Full View Modal */}
      {showFullView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFullView(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-[1200px] w-[92vw] h-[85vh] p-6 grid grid-cols-12 gap-6 overflow-hidden">
            {/* Close */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowFullView(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              ×
            </button>

            {/* Large image */}
            <div className="col-span-8 h-full flex items-center justify-center bg-white overflow-hidden">
              <img
                src={selectedImage?.url || '/images/placeholder.jpg'}
                alt={selectedImage?.alt || title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnail rail */}
            <div className="col-span-4">
              <div className="text-sm font-medium mb-3">
                Color:{' '}
                {colors && colors.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-2 align-middle">
                    {colors.map((c, i) => (
                      <span key={`${c}-${i}`} className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-xs">
                        {c}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="font-normal">{color || '—'}</span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 overflow-auto max-h-[65vh] pr-1">
                {images?.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}-modal`}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative aspect-[4/3] rounded-md overflow-hidden border ${
                      idx === selectedIndex ? 'border-amazon-orange ring-1 ring-amazon-orange' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt={img.alt || `${title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;


