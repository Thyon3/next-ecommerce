"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getOneProduct, getSimilarProducts } from "@/actions/product/product";
import Gallery from "@/domains/product/components/gallery";
import ProductBoard from "@/domains/product/components/productBoard";
import ProductCard from "@/domains/product/components/productCard";
import ReviewForm from "@/domains/product/components/ReviewForm";
import { LikeIcon, MinusIcon } from "@/shared/components/icons/svgIcons";
import Popup from "@/shared/components/UI/popup";
import { SK_Box } from "@/shared/components/UI/skeleton";
import { TProductPageInfo } from "@/shared/types/product";
import { addRecentlyViewed } from "@/shared/utils/localStorage";
import { usePageTracking } from "@/shared/hooks/usePageTracking";
import { PageType } from "@prisma/client";

const ProductPage = () => {
  const router = useRouter();
  const { productId } = useParams<{ productId: string[] }>();
  const [productInfo, setProductInfo] = useState<TProductPageInfo | null | undefined>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  usePageTracking(PageType.PRODUCT, productId?.toString());

  if (!productId) router.push("/");

  const refreshData = async () => {
    const response = await getOneProduct(productId.toString());
    if (response.error) router.push("/");
    setProductInfo(response.res);

    if (response.res) {
      const similar = await getSimilarProducts(response.res.category.id, response.res.id);
      if (similar.res) setSimilarProducts(similar.res);
    }
  };

  useEffect(() => {
    refreshData();
    if (productId) {
      addRecentlyViewed(productId.toString());
    }
  }, [productId, router]);

  if (productInfo === undefined) return "";
  let fullPath = "";

  return (
    <div className="storeContainer">
      <div className="w-full h-auto mt-[160px] flex flex-col">
        <div className="w-full flex flex-col lg:flex-row gap-12">
          <div className="flex-grow">
            <div className="block text-gray-700 w-full mb-10 text-sm">
              {productInfo ? (
                <>
                  <Link href={"/"} className="hover:font-medium after:mx-1 after:content-['/'] hover:text-gray-800">
                    Home
                  </Link>
                  {productInfo.path.map((item, index) => {
                    fullPath += "/" + item.url;
                    return (
                      <Link
                        key={item.url + index}
                        href={"/list" + fullPath}
                        className="after:content-['/'] last:after:content-[''] after:mx-1 hover:text-gray-800"
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <SK_Box width="60%" height="15px" />
              )}
            </div>
            <Gallery images={productInfo?.images} />
          </div>
          <div className="lg:w-[512px] w-full">
            {productInfo ? (
              <ProductBoard
                boardData={{
                  id: productInfo.id,
                  isAvailable: productInfo.isAvailable,
                  defaultQuantity: 1,
                  name: productInfo.name,
                  price: productInfo.price,
                  dealPrice: productInfo.salePrice || undefined,
                  saleExpiry: productInfo.saleExpiry,
                  shortDesc: productInfo.desc || "",
                  specialFeatures: productInfo.specialFeatures,
                  reviewsCount: productInfo.Review?.length || 0,
                }}
              />
            ) : (
              <div className="flex flex-col">
                <SK_Box width="60%" height="14px" />
                <div className="flex flex-col mt-10 gap-5">
                  <SK_Box width="40%" height="30px" />
                  <SK_Box width="90%" height="16px" />
                </div>
                <div className="flex flex-col gap-4 mt-10">
                  <SK_Box width="40%" height="14px" />
                  <SK_Box width="40%" height="14px" />
                  <SK_Box width="40%" height="14px" />
                </div>
                <div className="flex flex-col gap-4 mt-16">
                  <SK_Box width="30%" height="40px" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-auto flex gap-12 mt-10">
          <div className="w-full flex flex-col">
            {/* ----------------- SPECIFICATION SECTION ----------------- */}
            <div className="w-full mb-[100px]">
              <h2 className="font-light block text-2xl text-gray-900 py-5 border-b border-gray-300">Specification</h2>
              {productInfo ? (
                productInfo.specifications.map((spec, index) => (
                  <section key={index} className="w-full py-5 border-b border-gray-300">
                    <div className="flex items-center w-full">
                      <button className="size-8 inline-block relative border-none bg-white rounded-sm hover:bg-gray-200">
                        <MinusIcon width={12} className="absolute top-3.5 left-2.5 stroke-gray-700" />
                      </button>
                      <h3 className="ml-3 inline-block text-gray-700">{spec.groupName}</h3>
                    </div>
                    {spec.specs.map((row, index) => (
                      <div
                        key={index}
                        className="w-full pt-3 flex items-stretch bg-white text-sm rounded-lg hover:bg-gray-100"
                      >
                        <div className="min-w-[160px] flex items-start ml-[42px] text-gray-500">
                          <span>{row.name}</span>
                        </div>
                        <div className="font-medium text-gray-800">
                          <span key={index} className="block leading-5 min-h-8 h-auto">
                            {row.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </section>
                ))
              ) : (
                <>
                  <div className="flex flex-col mt-4 mb-16 gap-4">
                    <SK_Box width="200px" height="30px" />
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                  </div>
                  <div className="flex flex-col mt-4 mb-16 gap-4">
                    <SK_Box width="200px" height="30px" />
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ----------------- USER REVIEWS ----------------- */}
            <div className="flex flex-col w-full h-auto">
              <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                <h2 className="font-light block text-2xl text-gray-900">User Reviews</h2>
                <button
                  disabled={!productInfo}
                  onClick={() => setShowReviewForm(true)}
                  className="text-sm text-gray-900 px-6 py-1.5 rounded-md bg-gray-100 border border-gray-700 hover:bg-gray-200 active:bg-light-300"
                >
                  New Review
                </button>
              </div>
              <div className="flex flex-col w-full">
                {productInfo?.Review && productInfo.Review.length > 0 ? (
                  productInfo.Review.map((review: any) => (
                    <div key={review.id} className="flex flex-col w-full border-b border-gray-100 py-6 last:border-0">
                      <div className="flex items-center flex-wrap w-full text-sm">
                        <div className="flex h-8 items-center text-gray-800 font-medium">
                          <Image
                            src={review.user.image || "/images/images/defaultUser.png"}
                            className="rounded-full overflow-hidden mr-3"
                            alt={review.user.name || "User"}
                            width={32}
                            height={32}
                          />
                          <span>{review.user.name}</span>
                        </div>
                        <span className="text-[#f97a1f] ml-auto sm:ml-8 font-medium">Verified Purchase</span>
                        <div className="inline-block ml-8 pl-6 bg-[url('/icons/dateIcon.svg')] bg-no-repeat bg-[position:left_center] text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="ml-10 flex items-center gap-2">
                          <div className="flex items-center text-yellow-500 mr-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 ml-0 sm:ml-12 text-sm leading-6 text-gray-700">
                        <p>{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full my-[100px]">
          <h2 className="font-light block text-2xl text-gray-900">Similar Products</h2>
          <div className="flex justify-start gap-4 w-full overflow-x-auto pb-4 mt-6">
            {similarProducts.length > 0 ? (
              similarProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  imgUrl={product.images.map((img: string) => `/images/images/productImages/${img}`)}
                  name={product.name}
                  price={product.price}
                  specs={product.specialFeatures}
                  url={"/product/" + product.id}
                  dealPrice={product.salePrice || undefined}
                  staticWidth
                />
              ))
            ) : (
              <div className="text-gray-400 text-sm">No similar products found.</div>
            )}
          </div>
        </div>
      </div>
      {showReviewForm && (
        <Popup
          title="Write a Review"
          onClose={() => setShowReviewForm(false)}
          onCancel={() => setShowReviewForm(false)}
          onSubmit={() => { }} // Form handles its own submission
          isLoading={false}
          content={
            <ReviewForm
              productId={productId.toString()}
              onSuccess={() => {
                setShowReviewForm(false);
                refreshData();
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          }
        />
      )}
    </div>
  );
};

export default ProductPage;
