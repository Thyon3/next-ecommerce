"use server";
import { z } from "zod";

import { TFilters, TListItem } from "@/domains/store/productList/types";
import { TCategory } from "@/shared/types/categories";
import { TListSort } from "@/domains/store/productList/types/";
import { db } from "@/shared/lib/db";
import { TProductPath } from "@/shared/types/product";

const ValidateSort = z.object({
  sortName: z.enum(["id", "price", "name"]),
  sortType: z.enum(["asc", "desc"]),
});

const pathToArray = (path: string) => {
  if (!path.includes("/list/")) return null;
  const parts = path.split("/list/");
  if (parts.length < 2) return null;
  const pathWithoutList = parts[1];
  const pathArray = pathWithoutList.split("/");
  return pathArray;
};

export const getList = async (path: string, sortData: TListSort, filters: TFilters, searchQuery?: string) => {
  try {
    if (!ValidateSort.safeParse(sortData).success) return { error: "Invalid Path" };
    if (searchQuery) {
      const result = await getProductsBySearch(searchQuery, sortData, filters);
      if (!result) return { error: "Can't Find Product!" };
      return { products: result, subCategories: [] };
    }

    if (!path || path === "") return { error: "Invalid Path" };
    const pathArray = pathToArray(path);
    if (!pathArray || pathArray.length > 3 || pathArray.length === 0) return { error: "Invalid Path" };

    const categoryID = await findCategoryFromPathArray(pathArray);
    if (categoryID === "") return { error: "Invalid Path Name" };

    const subCategories: TProductPath[] | null = await getSubCategories(categoryID);
    if (!subCategories) return { error: "Invalid Sub Categories" };

    const allRelatedCategories = await findCategoryChildren(categoryID, pathArray.length);
    if (!allRelatedCategories || allRelatedCategories.length === 0) return { error: "Invalid Path Name" };

    const result = await getProductsByCategories(allRelatedCategories, sortData, filters);
    if (!result) return { error: "Can't Find Product!" };

    return { products: result, subCategories: subCategories };
  } catch (error) {
    console.error("getList Error:", error);
    return { error: "Internal Server Error" };
  }
};

const getSubCategories = async (catID: string) => {
  try {
    const result: TCategory[] = await db.category.findMany({
      where: {
        parentID: catID,
      },
    });
    if (!result) return null;
    const subCategories: TProductPath[] = [];
    result.forEach((cat) => {
      subCategories.push({
        label: cat.name,
        url: cat.url,
      });
    });
    return subCategories;
  } catch {
    return null;
  }
};

const findCategoryFromPathArray = async (pathArray: string[]) => {
  try {
    const result: TCategory[] = await db.category.findMany();
    if (!result) return "";

    let parentID: string | null = null;
    let categoryID = "";

    for (const path of pathArray) {
      const cat = result.find((c) => c.parentID === parentID && c.url === path);
      if (!cat) return "";
      categoryID = cat.id;
      parentID = categoryID;
    }
    return categoryID;
  } catch {
    return "";
  }
};

const findCategoryChildren = async (catID: string, numberOfParents: number) => {
  try {
    if (numberOfParents === 3) return [catID];
    const result: TCategory[] = await db.category.findMany();
    if (!result) return null;

    const tempChildren: string[] = [];
    result.forEach((cat) => {
      if (cat.parentID === catID) {
        tempChildren.push(cat.id);
      }
    });

    if (numberOfParents === 1) {
      const lastChildren: string[] = [];
      result.forEach((cat) => {
        if (cat.parentID && tempChildren.includes(cat.parentID)) {
          lastChildren.push(cat.id);
        }
      });
      return tempChildren.concat([catID], lastChildren);
    }

    return tempChildren.concat([catID]);
  } catch {
    return null;
  }
};

const getProductsByCategories = async (categories: string[], sortData: TListSort, filters: TFilters) => {
  const brands: string[] | null = filters.brands.length > 0 ? [] : null;
  if (brands) {
    filters.brands.forEach((brand) => {
      if (brand.isSelected) return brands.push(brand.id);
    });
    // Fix: If filters exist but strictly NO brands are selected, we should probably return empty or handle it.
    // If 'brands' is empty array here, it means user deselected all.
  }

  let isAvailable: boolean | null = null;
  if (filters.stockStatus === "inStock") isAvailable = true;
  if (filters.stockStatus === "outStock") isAvailable = false;

  const isInitialPrice = filters.priceMinMax[1] === 0;

  try {
    const result: TListItem[] | null = await db.product.findMany({
      where: {
        AND: [
          {
            categoryID: { in: categories },
          },
          isAvailable !== null
            ? {
              isAvailable: isAvailable,
            }
            : {},
          brands && brands.length > 0
            ? {
              brandID: { in: brands },
            }
            : brands !== null ? { brandID: { in: [] } } : {}, // If brands is empty array (deselected all), match nothing. If null (no filters), ignore.
          !isInitialPrice
            ? {
              price: {
                gt: filters.priceMinMax[0],
                lte: filters.priceMinMax[1],
              },
            }
            : {},
        ],
      },
      select: {
        id: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
        name: true,
        price: true,
        salePrice: true,
        specialFeatures: true,
        isAvailable: true,
      },
      orderBy: {
        [sortData.sortName]: sortData.sortType,
      },
    });
    if (!result) return null;
    return result;
  } catch {
    return null;
  }

};

const getProductsBySearch = async (query: string, sortData: TListSort, filters: TFilters) => {
  const brands: string[] | null = filters.brands.length > 0 ? [] : null;
  if (brands) {
    filters.brands.forEach((brand) => {
      if (brand.isSelected) return brands.push(brand.id);
    });
  }

  let isAvailable: boolean | null = null;
  if (filters.stockStatus === "inStock") isAvailable = true;
  if (filters.stockStatus === "outStock") isAvailable = false;

  const isInitialPrice = filters.priceMinMax[1] === 0;

  try {
    const result: TListItem[] | null = await db.product.findMany({
      where: {
        AND: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          isAvailable !== null
            ? {
              isAvailable: isAvailable,
            }
            : {},
          brands && brands.length > 0
            ? {
              brandID: { in: brands },
            }
            : brands !== null ? { brandID: { in: [] } } : {},
          !isInitialPrice
            ? {
              price: {
                gt: filters.priceMinMax[0],
                lte: filters.priceMinMax[1],
              },
            }
            : {},
        ],
      },
      select: {
        id: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
        name: true,
        price: true,
        salePrice: true,
        specialFeatures: true,
        isAvailable: true,
      },
      orderBy: {
        [sortData.sortName]: sortData.sortType,
      },
    });
    if (!result) return null;
    return result;
  } catch {
    return null;
  }
};
