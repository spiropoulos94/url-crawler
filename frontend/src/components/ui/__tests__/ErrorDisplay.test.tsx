import { render, screen } from '../../../test-utils';
import { ErrorDisplay } from '../ErrorDisplay';
import { vi } from 'vitest';

describe('ErrorDisplay', () => {
  it('renders with default props', () => {
    render(<ErrorDisplay onRetry={() => {}} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorDisplay 
        title="Custom Error" 
        message="This is a custom error message" 
      />
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('This is a custom error message')).toBeInTheDocument();
  });

  it('hides retry button when showRetry is false', () => {
    render(<ErrorDisplay showRetry={false} />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay onRetry={onRetry} />);
    
    screen.getByText('Try Again').click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows error details when enabled', () => {
    const error = new Error('Test error');
    
    render(<ErrorDisplay error={error} showDetails={true} />);
    
    if (import.meta.env.DEV) {
      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();
    }
  });
});