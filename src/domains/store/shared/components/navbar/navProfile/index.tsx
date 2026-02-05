"use client";

import { useRef } from "react";
import Link from "next/link";

import { ProfileIcon } from "@/shared/components/icons/svgIcons";
import Button from "@/shared/components/UI/button";
import { useToggleMenu } from "@/shared/hooks/useToggleMenu";
import { cn } from "@/shared/utils/styling";

const NavBarProfile = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useToggleMenu(false, menuRef);

  const toggleMenu = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <div className="relative">
      <Button
        onClick={toggleMenu}
        className={cn(
          "h-9 hover:bg-transparent px-0 transition-all text-gray-500 text-sm duration-300 border-none bg-transparent",
          isActive && "text-gray-900"
        )}
      >
        <ProfileIcon width={20} className="fill-none transition-all duration-300 stroke-gray-500 stroke-1" />
        <span className="select-none hidden lg:block ml-2">Account</span>
      </Button>
      <div
        ref={menuRef}
        className={cn(
          "w-[180px] absolute rounded-xl overflow-hidden flex flex-col gap-2 top-[48px] right-0 border border-gray-100 bg-white shadow-xl scale-[0.95] invisible opacity-0 transition-all duration-300 p-3 z-10",
          isActive && "scale-100 visible opacity-100"
        )}
      >
        <Link href="/login" className="w-full">
          <Button
            variant="secondary"
            size="small"
            className="w-full justify-center bg-transparent border-none text-gray-600 hover:bg-gray-50 hover:text-black font-semibold"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/signup" className="w-full">
          <Button
            variant="primary"
            size="small"
            className="w-full justify-center bg-black hover:bg-gray-800 text-white border-none rounded-lg font-bold shadow-sm"
          >
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NavBarProfile;
