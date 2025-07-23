import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { urlAPI } from '../services/api';
import { Plus, AlertCircle } from 'lucide-react';

export const AddURL: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const addUrlMutation = useMutation({
    mutationFn: urlAPI.add,
    onSuccess: () => {
      queryClient.invalidateQueries(['urls']);
      setUrl('');
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to add URL');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    addUrlMutation.mutate({ url: url.trim() });
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New URL</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://example.com"
              className="input-field flex-1"
              disabled={addUrlMutation.isLoading}
            />
            <button
              type="submit"
              disabled={addUrlMutation.isLoading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addUrlMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>Add URL</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};