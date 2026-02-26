export type TComparisonProduct = {
  productId: string;
  addedAt: number;
};

export type TComparisonState = {
  items: TComparisonProduct[];
  maxItems: number;
};
