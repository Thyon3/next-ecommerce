"use client";

import { useEffect, useState } from "react";

import { addProduct, getAllProducts } from "@/actions/product/product";
import ProductForm from "@/domains/admin/components/product/productForm";
import ProductListItem from "@/domains/admin/components/product/productListItem";
import Button from "@/shared/components/UI/button";
import Popup from "@/shared/components/UI/popup";
import { TAddProductFormValues, TProductListItem } from "@/shared/types/product";

const initialForm: TAddProductFormValues = {
  name: "",
  brandID: "",
  specialFeatures: ["", "", ""],
  isAvailable: false,
  desc: "",
  price: "",
  salePrice: "",
  images: [],
  categoryID: "",
  specifications: [],
  stock: 0,
};

const AdminProducts = () => {
  const [showProductWindow, setShowProductWindow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<TAddProductFormValues>(initialForm);
  const [productsList, setProductsList] = useState<TProductListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getProductsList();
  }, []);

  const getProductsList = async () => {
    const response = await getAllProducts();
    if (response.res) setProductsList(response.res);
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    const result = await addProduct(formValues);
    if (result.error) {
      setIsLoading(false);
    }
    if (result.res) {
      setIsLoading(false);
      setShowProductWindow(false);
    }
  };

  return (
    <div className="flex flex-col p-8">
      <div className="flex items-center justify-between h-20 mb-8 gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-black outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowProductWindow(true)}>Add new product</Button>
      </div>
      <div className="flex flex-col text-sm text-gray-800 gap-2">
        {productsList.length ? (
          <>
            {productsList
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((product) => (
                <ProductListItem key={product.id} data={product} requestReload={getProductsList} />
              ))}
          </>
        ) : (
          <div>There is no product!</div>
        )}
      </div>
      {showProductWindow && (
        <Popup
          content={<ProductForm formValues={formValues} onChange={setFormValues} />}
          isLoading={isLoading}
          onCancel={() => setShowProductWindow(false)}
          onClose={() => setShowProductWindow(false)}
          onSubmit={() => handleAddProduct()}
          confirmBtnText="Add Product"
          title="Add New Product"
        />
      )}
    </div>
  );
};

export default AdminProducts;
