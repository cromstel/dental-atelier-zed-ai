import Head from 'next/head';
import Button from '../components/Button';
import PageHero from '../components/PageHero';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found | Dental Atelier</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageHero
        eyebrow="404"
        title="We couldn’t find that page"
        description="The page may have moved or the address may be incorrect. Return to the homepage to continue exploring Dental Atelier."
        imageSrc="/images/about-dental-lab-photo-06.webp"
        imageAlt="A workspace inside the Dental Atelier laboratory"
      >
        <Button href="/">Back to home</Button>
      </PageHero>
    </>
  );
}
