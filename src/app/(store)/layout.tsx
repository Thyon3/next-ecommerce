"use client";
import { Provider } from "react-redux";

import StoreNavBar from "@/domains/store/shared/components/navbar";
import BackToTopButton from "@/shared/components/UI/BackToTopButton";
import Warning from "@/domains/store/shared/components/warning";
import { shoppingCartStore } from "@/store/shoppingCart";

import StoreFooter from "../../domains/store/shared/components/footer/index";
import Footer from "@/shared/components/UI/Footer"; // Assuming Footer is a shared component

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Provider store={shoppingCartStore}>
        <StoreNavBar />
        <main className="min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-120px)] w-full max-w-[1920px] mx-auto bg-gray-50 pb-10">
          {children}
        </main>
        <Warning />
        <BackToTopButton />
      </Provider>
      <Footer />
    </>
  );
};

export default StoreLayout;
