export const galleryAssets = [
  {
    url: '/images/portfolio-smile-before.webp',
    label: 'Smile portfolio — before',
    title: 'Before',
    altText: 'Patient smile before treatment',
    category: 'PORTFOLIO',
  },
  {
    url: '/images/portfolio-smile-after.webp',
    label: 'Smile portfolio — after',
    title: 'After',
    altText: 'Patient smile after treatment',
    category: 'PORTFOLIO',
  },
  ...Array.from({ length: 6 }, (_, index) => ({
    url: `/images/about-dental-lab-photo-${String(index + 1).padStart(2, '0')}.webp`,
    label: `Dental lab photo ${String(index + 1).padStart(2, '0')}`,
    title: `Dental Atelier laboratory ${index + 1}`,
    altText: `Dental Atelier laboratory photo ${index + 1}`,
    category: 'LAB',
  })),
];
