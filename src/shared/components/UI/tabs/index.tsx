"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/styling";

type Tab = {
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: number;
};

export const Tabs = ({ tabs, defaultTab = 0 }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              activeTab === index
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">{tabs[activeTab]?.content}</div>
    </div>
  );
};
