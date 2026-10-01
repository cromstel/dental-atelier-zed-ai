import Image from 'next/image';

export default function ImageGallery({ images, label = 'Image gallery', columns = 3 }) {
  const columnClass = columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';

  return (
    <ul aria-label={label} className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${columnClass}`}>
      {images.map((image) => (
        <li className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" key={image.src}>
          <figure>
            <div className={`relative overflow-hidden bg-gray-100 ${image.portrait ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                src={image.src}
              />
            </div>
            {image.caption && <figcaption className="px-4 py-3 text-sm font-medium text-gray-700">{image.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  );
}
