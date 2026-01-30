"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/utils/styling";

const LINKS = [
  { title: "Dashboard", url: "/admin/dashboard", icon: "/icons/dashboard.svg" },
  { title: "Categories", url: "/admin/categories", icon: "/icons/category.svg" },
  { title: "Products", url: "/admin/products", icon: "/icons/product.svg" },
  { title: "Brands", url: "/admin/brands", icon: "/icons/brand.svg" },
  { title: "Traffic View", url: "/admin/trafficView/1", icon: "/icons/analytics.svg" },
];

const AdminSidebar = () => {
  const pathName = usePathname();

  return (
    <aside className="w-[280px] bg-white border-r border-gray-200 min-h-screen flex flex-col pt-5">
      <h2 className="px-6 text-xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <div className="flex flex-col gap-1 px-3">
        {LINKS.map((link) => (
          <Link
            href={link.url}
            key={link.title}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
              pathName === link.url
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {/* Placeholder icons since we might not have all svgs */}
            <div className={cn("w-5 h-5 rounded-full shrink-0", pathName === link.url ? "bg-white/20" : "bg-gray-200")} />
            {link.title}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
