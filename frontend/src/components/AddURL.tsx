import React from "react";
import { useAddURL } from "../hooks/useURLs";
import { useForm } from "../hooks/useForm";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import type { AxiosError } from "axios";

interface AddURLFormData extends Record<string, unknown> {
  url: string;
}

const validateURL = (url: unknown): string | undefined => {
  const urlString = String(url);
  if (!urlString.trim()) {
    return "URL is required";
  }

  try {
    new URL(urlString.startsWith("http") ? urlString : `https://${urlString}`);
    return undefined;
  } catch {
    return "Please enter a valid URL";
  }
};

export const AddURL: React.FC = React.memo(() => {
  const addUrlMutation = useAddURL();

  const form = useForm<AddURLFormData>(
    { url: "" },
    {
      url: {
        required: true,
        custom: validateURL,
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validateForm()) {
      return;
    }

    form.setIsSubmitting(true);

    try {
      await addUrlMutation.mutateAsync({
        url: form.data.url.trim(),
      });

      // Success! Reset form
      form.reset();

      // Show success state briefly
      setTimeout(() => {
        form.setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      let errorMessage = "Failed to add URL";
      
      if (axiosError.response?.data?.error) {
        const backendError = axiosError.response.data.error;
        if (backendError.includes("Duplicate entry") || backendError.includes("already exists")) {
          errorMessage = "This URL already exists in the system. If you recently deleted it, please wait a moment and try again, or check if it's still in your URL list below.";
        } else {
          errorMessage = backendError;
        }
      }
      
      form.setErrors({
        url: errorMessage,
      });
      form.setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
          Add New URL
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Enter a website URL to start crawling and analyzing its content
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3"
            >
              Website URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  id="url"
                  value={form.data.url}
                  onChange={(e) => form.setFieldValue("url", e.target.value)}
                  placeholder="https://example.com or example.com"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border border-gray-200 bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 placeholder-gray-500 text-base sm:text-lg"
                  disabled={form.isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={form.isSubmitting || !form.data.url.trim()}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] cursor-pointer"
              >
                {form.isSubmitting ? (
                  addUrlMutation.isSuccess ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  )
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Add URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {form.errors.url && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="p-1 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-700">
                {form.errors.url}
              </span>
            </div>
          )}

          {addUrlMutation.isSuccess && !form.isSubmitting && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-700">
                URL added successfully! It will be crawled shortly.
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
});
