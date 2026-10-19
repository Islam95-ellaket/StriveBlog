import { render, screen } from '@testing-library/react';
import Footer from './components/footer/Footer';

test('renderizza il footer con il copyright', () => {
  render(<Footer />);
  const footerText = screen.getByText(/Strive School/i);
  expect(footerText).toBeInTheDocument();
});
