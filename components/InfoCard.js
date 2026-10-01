import Image from 'next/image';
import Link from 'next/link';

export default function InfoCard({ title, description, href, imageSrc, imageAlt = '' }) {
  const content = (
    <article className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageSrc && (
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image alt={imageAlt} className="object-cover" fill sizes="(max-width: 640px) 100vw, 50vw" src={imageSrc} />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-brand">{title}</h3>
        <p className="mt-3 leading-7 text-gray-700">{description}</p>
        {href && <span className="mt-4 inline-block text-sm font-semibold text-brand">Learn more <span aria-hidden="true">→</span></span>}
      </div>
    </article>
  );

  return href ? <Link className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky" href={href}>{content}</Link> : content;
}
