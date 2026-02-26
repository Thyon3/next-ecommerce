"use client";

import { useState } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
};

export const SearchBar = ({ onSearch, placeholder = "Search...", delay = 500 }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, delay);

  useState(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  });

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};
