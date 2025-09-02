import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app brand', () => {
  render(<App />);
  const brand = screen.getByText(/Notes/i);
  expect(brand).toBeInTheDocument();
});

test('has search input', () => {
  render(<App />);
  const search = screen.getByLabelText(/Search notes/i);
  expect(search).toBeInTheDocument();
});
