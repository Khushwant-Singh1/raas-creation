import { Products } from "@/components/admin/products-table";
import { apiClient } from "@/lib/axiosClient";
import { Product } from "@/types/types";

export const productApi = {
  getAll: async (): Promise<Products[]> => {
    const response = await apiClient.get("/api/products");
    return response.data.products;
  },
  getBySlug: async (slug: string): Promise<Products> => {
    const response = await apiClient.get(`/api/products/slug/${slug}`);
    return response.data.product;
  },
  getProducts: async (
    currentPage: number,
    itemsPerPage: number,
    debouncedSearchTerm: string,
    status?: string
  ): Promise<{
    success: boolean,
    products: Products[];
    pagination: {
      totalPages: number;
      currentPage: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const response = await apiClient.get("/api/products", {
      params: {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        ...(status && { status }),
      },
    });
    return response.data;
  },
  getById: async (id: string): Promise<Products> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.product;
  },
  addProduct: async (product: Product): Promise<Products> => {
    const response = await apiClient.post("/api/products", product);
    return response.data.product;
  },
  updateProduct: async (id: string, product: Product): Promise<Products> => {
    const response = await apiClient.put(`/api/products/${id}`, product);
    return response.data.updatedProduct;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
  updateStatus: async (id: string, status: string): Promise<Products> => {
    const response = await apiClient.put(`/api/products/status/${id}`, {
      status,
    });
    return response.data;
  },
  getDashBoardOverview: async (): Promise<{
    totalProducts: number;
    revenue: number,
    growth: string,
    usersCount: number
  }> => {
    const response = await apiClient.get("/api/products/overview");
    return response.data;
  }
};
