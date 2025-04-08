export interface ProductPageProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  shop: {
    _id: string;
    name: string;
  };
}

export interface ProductPageFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  keyword?: string;
}

export interface ProductPage {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  viewCount: number;
  products: ProductPageProduct[];
  filters: ProductPageFilters;
  createdAt: string;
  updatedAt: string;
}
