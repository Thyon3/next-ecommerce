"use client";
import { Provider } from "react-redux";

import StoreNavBar from "@/domains/store/shared/components/navbar";
import Warning from "@/domains/store/shared/components/warning";
import BackToTopButton from "@/shared/components/UI/BackToTopButton";
import { shoppingCartStore } from "@/store/shoppingCart";
import ComparisonTray from "@/domains/product/components/ComparisonTray";
import NewsletterPopup from "@/domains/store/shared/components/NewsletterPopup";

import StoreFooter from "../../domains/store/shared/components/footer/index";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Provider store={shoppingCartStore}>
        <StoreNavBar />
        <main className="min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-120px)] w-full max-w-[1920px] mx-auto bg-gray-50 pb-10">
          {children}
        </main>
        <StoreFooter />
        <Warning />
        <BackToTopButton />
        <ComparisonTray />
        <NewsletterPopup />
      </Provider>
    </>
  );
};

export default StoreLayout;
