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

  const handleExport = () => {
    window.location.href = '/api/admin/products/export';
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv })
        });
        const data = await res.json();
        alert(`Import completed! Success: ${data.filter((r: any) => r.status === 'SUCCESS').length}, Failed: ${data.filter((r: any) => r.status === 'FAILED').length}`);
        getProductsList();
      } catch (error) {
        console.error("Import failed", error);
        alert("Import failed. Check console for details.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
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
        <div className="flex gap-2">
          <label className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors shadow-sm flex items-center justify-center">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <Button className="!bg-gray-100 !text-gray-900 border border-gray-200" onClick={handleExport}>Export CSV</Button>
          <Button onClick={() => setShowProductWindow(true)}>Add new product</Button>
        </div>
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
