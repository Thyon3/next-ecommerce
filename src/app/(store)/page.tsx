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
