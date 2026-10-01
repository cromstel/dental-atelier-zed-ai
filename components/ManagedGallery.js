import { useEffect, useState } from 'react';
import ImageGallery from './ImageGallery';

export default function ManagedGallery({ category, fallbackImages, label, columns = 3 }) {
  const [images, setImages] = useState(fallbackImages);

  useEffect(() => {
    let active = true;

    fetch('/api/gallery')
      .then((response) => (response.ok ? response.json() : null))
      .then((records) => {
        if (!active || !Array.isArray(records)) return;
        setImages(
          records
            .filter((record) => record.category === category)
            .map((record) => ({
              src: record.url,
              alt: record.altText,
              caption: record.title,
            })),
        );
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [category]);

  return images.length ? (
    <ImageGallery columns={columns} images={images} label={label} />
  ) : (
    <p className="rounded-lg bg-white p-5 text-gray-600">
      There are no images in this gallery yet.
    </p>
  );
}
