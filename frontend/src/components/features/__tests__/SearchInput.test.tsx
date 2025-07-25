import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';
import { vi } from 'vitest';

describe('SearchInput', () => {
  it('renders with initial value', () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    
    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search URLs..." />);
    
    expect(screen.getByPlaceholderText('Search URLs...')).toBeInTheDocument();
  });

  it('calls onChange after debounce delay', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={100} />);
    
    const input = screen.getByRole('searchbox');
    
    // Type in the input
    await user.type(input, 'test');
    
    // Should not call immediately
    expect(onChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('updates internal state when value prop changes', () => {
    const { rerender } = render(<SearchInput value="initial" onChange={() => {}} />);
    
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
    
    rerender(<SearchInput value="updated" onChange={() => {}} />);
    
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });

  it('does not call onChange if value has not changed', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} debounceMs={50} />);
    
    // Wait for any potential debounced calls
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(onChange).not.toHaveBeenCalled();
  });
});