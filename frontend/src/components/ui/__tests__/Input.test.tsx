import { render, screen } from '../../../test-utils';
import { Input } from '../Input';
import { Search } from 'lucide-react';

describe('Input', () => {
  it('renders basic input', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
  });

  it('renders with icon', () => {
    render(<Input icon={Search} placeholder="Search..." />);
    
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('pl-10');
  });

  it('applies error styles when error is present', () => {
    render(<Input error="Error message" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300', 'focus:border-red-400');
  });

  it('applies normal styles when no error', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-gray-200', 'focus:border-primary-400');
  });

  it('forwards all input props', () => {
    render(<Input type="email" required disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });
});