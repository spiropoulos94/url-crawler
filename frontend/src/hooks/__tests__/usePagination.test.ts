import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => usePagination());
    
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.search).toBe('');
    expect(result.current.sortBy).toBe('created_at');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('initializes with custom values', () => {
    const { result } = renderHook(() => usePagination({
      initialPage: 2,
      initialLimit: 20,
      initialSearch: 'test',
      initialSortBy: 'name',
      initialSortOrder: 'asc'
    }));
    
    expect(result.current.page).toBe(2);
    expect(result.current.limit).toBe(20);
    expect(result.current.search).toBe('test');
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('handles sorting correctly', () => {
    const { result } = renderHook(() => usePagination());
    
    // Sort by new column
    act(() => {
      result.current.handleSort('name');
    });
    
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
    
    // Sort by same column again (toggle order)
    act(() => {
      result.current.handleSort('name');
    });
    
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('handles search and resets page', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 3 }));
    
    act(() => {
      result.current.handleSearch('test search');
    });
    
    expect(result.current.search).toBe('test search');
    expect(result.current.page).toBe(1);
  });

  it('handles page navigation', () => {
    const { result } = renderHook(() => usePagination());
    
    act(() => {
      result.current.goToPage(5);
    });
    expect(result.current.page).toBe(5);
    
    act(() => {
      result.current.nextPage(10);
    });
    expect(result.current.page).toBe(6);
    
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.page).toBe(5);
  });

  it('prevents going below page 1', () => {
    const { result } = renderHook(() => usePagination());
    
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.page).toBe(1);
  });

  it('prevents going above max pages', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 10 }));
    
    act(() => {
      result.current.nextPage(10);
    });
    
    expect(result.current.page).toBe(10);
  });

  it('resets to initial values', () => {
    const { result } = renderHook(() => usePagination({
      initialPage: 2,
      initialLimit: 20,
      initialSearch: 'initial',
    }));
    
    // Change values
    act(() => {
      result.current.setPage(5);
      result.current.setLimit(50);
      result.current.handleSearch('changed');
      result.current.handleSort('name');
    });
    
    // Reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.page).toBe(2);
    expect(result.current.limit).toBe(20);
    expect(result.current.search).toBe('initial');
    expect(result.current.sortBy).toBe('created_at');
    expect(result.current.sortOrder).toBe('desc');
  });
});