import { Metadata } from "next";

import {
  CollectionCards,
  CompanyLogoList,
  HomeCategoryList,
  HomeSlider,
  LatestBlogPosts,
  TodayDealCards,
  TopSellingProductsList,
  WideCardRow,
} from "@/domains/store/homePage/components";
import { threeSaleCards, twoSaleCards } from "@/domains/store/homePage/constants";
import RecentlyViewed from "@/domains/product/components/RecentlyViewed";
import Recommendations from "@/domains/product/components/Recommendations";
import FlashSaleBanner from "@/domains/product/components/FlashSaleBanner";

title: "THYONX"

export default function Home() {
  return (
    <div className="w-full bg-mint-500">
      <div className="storeContainer flex-col">
        <div className="flex w-full mt-40">
          <HomeCategoryList />
          <HomeSlider />
        </div>
        <WideCardRow cards={threeSaleCards} />
        <TodayDealCards />
        <div className="my-10">
          <FlashSaleBanner />
        </div>
        <WideCardRow cards={twoSaleCards} />
        <CollectionCards />
        <TopSellingProductsList />
        <LatestBlogPosts />
        <CompanyLogoList />
        <Recommendations />
        <RecentlyViewed />
      </div>
    </div>
  );
}
