"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SearchIcon, XIcon } from "@/shared/components/icons/svgIcons";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/list/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="h-11 relative flex-1 mx-6 sm:mx-10">
            <input
                type="text"
                className="text-gray-800 hidden sm:block pl-4 size-full border-gray-300 focus:border-gray-500 border rounded-lg outline-gray-500 sm:pl-12"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <div className="absolute top-3.5 left-5 hidden sm:block pointer-events-none">
                <SearchIcon width={16} stroke="#6b7280" strokeWidth={1.5} />
            </div>
            {query && (
                <button
                    onClick={() => setQuery("")}
                    className="absolute top-3.5 right-4 hidden sm:block text-gray-500 hover:text-gray-700"
                >
                    <XIcon width={16} stroke="currentColor" strokeWidth={1.5} />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
