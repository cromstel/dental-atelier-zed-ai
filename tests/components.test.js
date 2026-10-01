import { render, screen } from '@testing-library/react';
import Button from '../components/Button';
import InfoCard from '../components/InfoCard';

describe('shared components', () => {
  it('renders a button link with its accessible name', () => {
    render(<Button href="/contact-us">Contact Dental Atelier</Button>);

    expect(screen.getByRole('link', { name: 'Contact Dental Atelier' })).toHaveAttribute('href', '/contact-us');
  });

  it('renders an informational card and its destination', () => {
    render(<InfoCard title="Services" description="Explore our services." href="/services" />);

    expect(screen.getByRole('link', { name: /services explore our services/i })).toHaveAttribute('href', '/services');
  });
});
