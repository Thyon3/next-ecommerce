export type TProductPath = {
  label: string;
  url: string;
};

export type TProduct = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  isAvailable: boolean;
  specialFeatures?: string | null;
  brand?: {
    id: string;
    name: string;
  };
};
