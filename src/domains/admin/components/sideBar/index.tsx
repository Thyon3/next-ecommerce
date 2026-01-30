```javascript
import Link from "next/link";
import { usePathname } from "next/navigation"; // Assuming usePathname is from next/navigation
import { cn } from "@/lib/utils"; // Assuming cn utility function is available

// Assuming LINKS and Image are defined elsewhere or need to be added.
// For this specific change, I will only replace the AdminSidebar component
// with the provided structure, and add placeholder definitions for missing imports
// to make it syntactically correct, as the provided "Code Edit" is incomplete
// and introduces new dependencies.

// Placeholder for Image component if not imported from 'next/image'
const Image = ({ src, alt, width, height, className }) => (
  <img src={src} alt={alt} width={width} height={height} className={className} />
);

// Placeholder for LINKS array
const LINKS = [
  { title: "Categories", url: "/admin/categories", icon: "/icons/category.svg" },
  { title: "Products", url: "/admin/products", icon: "/icons/product.svg" },
  { title: "Brands", url: "/admin/brands", icon: "/icons/brand.svg" },
  { title: "Traffic View", url: "/admin/trafficView/1", icon: "/icons/traffic.svg" },
];

const AdminSidebar = () => {
  const pathName = usePathname();

  return (
        href={"/admin/brands"}
      >
        Brands
      </Link>
      <Link
        className="w-full block px-4 py-2 text-gray-500 rounded-lg transition-colors duration-300 hover:bg-gray-100 active:bg-gray-200"
        href={"/admin/trafficView/1"}
      >
        Traffic View
      </Link>
    </aside>
  );
};

export default AdminSidebar;
