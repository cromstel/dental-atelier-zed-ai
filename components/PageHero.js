import Image from 'next/image';

export default function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  imageCaption,
  children,
}) {
  return (
    <section aria-labelledby="page-hero-heading" className="bg-brand text-white">
      <div className="mx-auto grid max-w-content items-center gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:gap-12 lg:py-20">
        <div>
          {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">{description}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl border border-white/20 shadow-xl sm:h-96 lg:h-[26rem]">
          <Image
            alt={imageAlt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={imageSrc}
          />
          {imageCaption && (
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/20 bg-brand/85 p-4 shadow-lg backdrop-blur-sm sm:inset-x-6 sm:bottom-6 sm:p-5">
              {imageCaption.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">{imageCaption.eyebrow}</p>}
              <p className="mt-2 text-lg font-medium leading-7">{imageCaption.text}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
