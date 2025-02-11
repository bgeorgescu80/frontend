import '@testing-library/jest-dom'
import {render, screen, fireEvent} from '@testing-library/svelte';
import NavBar from '../lib/header/Navbar.svelte';

describe('Navigation Bar', () => {
  it('shows proper heading when rendered main page', () => {
    const {getByText} = render(NavBar, { });
    expect(() => getByText("Docs")).not.toThrow();
    expect(getByText(/Docs/i)).toBeInTheDocument();
    expect(getByText(/Community/i)).toBeInTheDocument();
    expect(getByText(/About/i)).toBeInTheDocument();
  });

  it('Should render Navigation', () => {
    render(NavBar, {});
    const nav = screen.getByTestId(/navbar/i);
    expect(nav).toBeInTheDocument();
  });

  it('Should render Navigation Items', () => {
    render(NavBar, {});
    const nav = screen.getAllByTestId(/navigation-link/i);
    expect(nav.length).toBe(5);
  });

  it('Should load a logo', () => {
    render(NavBar, {});
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('alt', 'On-chain quantitative finance');
  })
});
