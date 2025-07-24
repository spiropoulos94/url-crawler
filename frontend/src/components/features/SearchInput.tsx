import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Container } from "../ui/Layout";
import { Icon } from "../ui/Icon";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  debounceMs = 300,
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Update internal state when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onChange, debounceMs, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Container className={`relative flex-1 min-w-0 ${className}`}>
      <Container className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Icon icon={Search} size="sm" className="text-gray-400" />
      </Container>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="px-3 py-2 w-full rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 text-sm shadow-sm focus:shadow-md"
      />
    </Container>
  );
};
