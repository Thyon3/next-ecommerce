"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/styling";

type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
};

export const Accordion = ({ items, allowMultiple = false }: AccordionProps) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-4 py-3 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
            >
              <span className="font-medium">{item.title}</span>
              <svg
                className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && <div className="px-4 py-3 bg-gray-50">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
};
