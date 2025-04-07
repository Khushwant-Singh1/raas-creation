"use client";

import { useState } from "react";
import { Upload, X, Check, Plus, Trash2, ChevronRight } from "lucide-react";
import Image from "next/image";
import UploadPopup from "../UploadPopup";
import { Category, Product, variants } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { categoryApi } from "@/lib/api/categories";
import cuid from "cuid";
import { productApi } from "@/lib/api/productdetails";
import { variantApi } from "@/lib/api/variants";

export function AddProductForm() {
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [varientId, setVarientId] = useState<string>("");
  const [varientImgPopUp, setVarientImgPopUp] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [derror, setderror] = useState<string>("");

  const router = useRouter();

  const Sizes = ["SIZE_5_5_M", "SIZE_6_M", "SIZE_6_5_M", "FREE_SIZE"];

  interface Variant {
    isOpen: boolean;
    id: string;
    color: string;
    customColor?: boolean;
    images: {
      url: string;
      type: "IMAGE" | "VIDEO";
    }[];
    sizes: {
      id: string;
      name: string;
      quantity: number;
    }[];
  }

  const [variants, setVariants] = useState<Variant[]>([]);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    variants: "",
    images: "",
    category: "",
    material: "",
  });

  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    discount: 1,
    categoryId: "",
    material: "",
    assets: [],
    status: "DRAFT",
  });

  const validateProduct = () => {
    const newErrors = {
      name: "",
      description: "",
      price: "",
      variants: "",
      images: "",
      category: "",
      material: "",
    };
    if (!product.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!product.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (product.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (product.assets?.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    if (!product.categoryId.trim()) {
      newErrors.category = "Please select a category";
    }

    if (!product.material.trim()) {
      newErrors.material = "Please select a material";
    }

    if (variants.length > 0) {
      const hasInvalidVariant = variants.some(
        (variant) => variant.sizes.length === 0
      );
      if (hasInvalidVariant) {
        newErrors.variants = "All variants must have color, images and sizes";
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: cuid(),
        color: "",
        images: [],
        sizes: [
          {
            id: cuid(),
            name: "SIZE_5",
            quantity: 0,
          },
        ],
        isOpen: true,
      },
    ]);
  };

  const addSize = (variantId: string) => {
    setVariants(
      variants.map((variant) => {
        if (variant.id === variantId) {
          return {
            ...variant,
            sizes: [...variant.sizes, { id: cuid(), name: "", quantity: 0 }],
          };
        }
        return variant;
      })
    );
  };

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  const removeSize = (variantId: string, sizeId: string) => {
    setVariants(
      variants.map((variant) => {
        if (variant.id === variantId) {
          return {
            ...variant,
            sizes: variant.sizes.filter((size) => size.id !== sizeId),
          };
        }
        return variant;
      })
    );
  };

  const handleAddVarientImage = (Urls: string) => {
    setVariants(
      variants.map((variant) => {
        if (variant.id === varientId) {
          return {
            ...variant,
            images: [...variant.images, { url: Urls, type: "IMAGE" }],
          };
        }
        return variant;
      })
    );
    setVarientImgPopUp(false);
  };

  const handleRemoveVariantImage = (variantId: string, imageIndex: number) => {
    setVariants(
      variants.map((variant) => {
        if (variant.id === variantId) {
          const newImages = [...variant.images];
          newImages.splice(imageIndex, 1);
          return {
            ...variant,
            images: newImages,
          };
        }
        return variant;
      })
    );
  };

  const categoryQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(),
  });

  const handleAddImage = (Urls: string) => {
    setProduct({
      ...product,
      assets: [...(product.assets || []), { url: Urls, type: "IMAGE" }],
    });
    setIsUploadPopupOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const newAssets = [...(product.assets || [])];
    newAssets.splice(index, 1);
    setProduct({
      ...product,
      assets: newAssets,
    });
  };

  const variantMutation = useMutation({
    mutationFn: (variant: {
      productId: string;
      color: string; // Added color property
      assets: {
        url: string;
        type: "IMAGE" | "VIDEO";
      }[];
      sizes: {
        size:
          | "SIZE_5"
          | "SIZE_6"
          | "SIZE_7"
          | "SIZE_8"
          | "SIZE_9"
          | "SIZE_10"
          | "SIZE_11"
          | "SIZE_12";
        stock: number;
      }[];
    }) => variantApi.addVariant(variant),
  });

  const productMutation = useMutation({
    mutationFn: (product: Product) => productApi.addProduct(product),
    onSuccess: (data) => {
      if (data && data.id) {
        const productId = data.id;
        variants.forEach((variant) => {
          variantMutation.mutate({
            productId,
            color: variant.color, // Include the color property
            assets: variant.images,
            sizes: variant.sizes.map((size) => ({
              size: size.name as
                | "SIZE_5"
                | "SIZE_6"
                | "SIZE_7"
                | "SIZE_8"
                | "SIZE_9"
                | "SIZE_10"
                | "SIZE_11"
                | "SIZE_12",
              stock: size.quantity,
            })),
          });
        });
      }

      router.push(`/admin/products/${data.id}`);
    },
  });

  const saveProduct = async () => {
    if (!validateProduct()) return;
    productMutation.mutate(product as Product);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Main content section */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Product Information */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-3 md:mb-4 text-[#4f507f]">
            Product Information
          </h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={product.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                  placeholder="Enter barcode"
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-3 md:mb-4 text-[#4f507f]">
            Media
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {product.assets?.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image.url || "/logo.svg"}
                  alt={`Product image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-32 object-contain rounded-md border border-gray-200"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setIsUploadPopupOpen(true)}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:text-[#4f507f] hover:border-[#4f507f] transition-colors"
            >
              <Upload size={24} />
              <span className="mt-2 text-sm">Add Image</span>
            </button>
          </div>
          {errors.images && (
            <p className="text-red-500 text-xs mt-2">{errors.images}</p>
          )}
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-3 md:mb-4 text-[#4f507f]">
            Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rs
                </span>
                <input
                  type="text"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*\.?\d*$/.test(value)) {
                      setError("Please enter a valid number");
                      return;
                    }
                    setError("");
                    setProduct({
                      ...product,
                      price: value ? parseFloat(value) : 0,
                    });
                  }}
                  className={`w-full pl-8 pr-3 py-2 bg-white border ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]`}
                  placeholder="0.00"
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rs
                </span>
                <input
                  type="text"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*\.?\d*$/.test(value)) {
                      setderror("Please enter a valid number");
                      return;
                    }
                    setderror("");
                    setProduct({
                      ...product,
                      discount: value ? parseFloat(value) : 0,
                    });
                  }}
                  className={`w-full pl-8 pr-3 py-2 bg-white border ${
                    derror ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]`}
                  placeholder="0.00"
                />
              </div>
              {derror && <p className="mt-1 text-sm text-red-500">{derror}</p>}
            </div>
          </div>
        </div>

        {/* Product Variants Section */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg md:text-xl font-semibold text-[#4f507f]">
              Product Variants
            </h2>
            <button
              onClick={addVariant}
              className="px-4 py-2 text-sm bg-[#4f507f] text-white rounded-md hover:bg-[#3e3f63] transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Variant
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 md:mb-6">
            Add different color variants and their corresponding sizes and
            quantities.
          </p>
          <div className="grid gap-6">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:border-[#4f507f] transition-colors duration-200"
              >
                <div
                  className="flex justify-between items-center mb-4 sm:mb-6 cursor-pointer"
                  onClick={() =>
                    setVariants(
                      variants.map((v) =>
                        v.id === variant.id ? { ...v, isOpen: !v.isOpen } : v
                      )
                    )
                  }
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div
                      className={`transform transition-transform ${
                        variant.isOpen ? "rotate-90" : ""
                      }`}
                    >
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
                {variant.isOpen && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Size Options
                    </label>
                    <div className="grid gap-4">
                      {variant.sizes.map((size) => (
                        <div
                          key={size.id}
                          className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center bg-gray-50 p-3 sm:p-4 rounded-lg"
                        >
                          <div className="w-full sm:w-48">
                            <label className="block text-xs text-gray-500 mb-1">
                              Size
                            </label>
                            <select
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4f507f] focus:border-[#4f507f] bg-white shadow-sm"
                              value={size.name}
                              onChange={(e) =>
                                setVariants(
                                  variants.map((v) => {
                                    if (v.id === variant.id) {
                                      return {
                                        ...v,
                                        sizes: v.sizes.map((s) =>
                                          s.id === size.id
                                            ? { ...s, name: e.target.value }
                                            : s
                                        ),
                                      };
                                    }
                                    return v;
                                  })
                                )
                              }
                            >
                              {Sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size.replace(/[^0-9]/g, "")}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full sm:w-48">
                            <label className="block text-xs text-gray-500 mb-1">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              placeholder="Enter quantity"
                              className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-[#4f507f] focus:border-[#4f507f] shadow-sm"
                              value={size.quantity}
                              onChange={(e) =>
                                setVariants(
                                  variants.map((v) => {
                                    if (v.id === variant.id) {
                                      return {
                                        ...v,
                                        sizes: v.sizes.map((s) =>
                                          s.id === size.id
                                            ? {
                                                ...s,
                                                quantity:
                                                  parseInt(e.target.value) || 0,
                                              }
                                            : s
                                        ),
                                      };
                                    }
                                    return v;
                                  })
                                )
                              }
                            />
                          </div>
                          <button
                            onClick={() => removeSize(variant.id, size.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-red-50 mt-6"
                            title="Remove Size Option"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addSize(variant.id)}
                      className="mt-4 text-sm text-[#4f507f] hover:text-[#3e3f63] flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[#edeefc] transition-colors duration-200"
                    >
                      <Plus size={16} />
                      Add Size Option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar section */}
      <div className="space-y-4 md:space-y-6">
        {/* Organization section */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-3 md:mb-4 text-[#4f507f]">
            Organization
          </h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1 sm:gap-2">
                {categoryQuery.isLoading ? (
                  <div className="flex items-center flex-1 justify-start py-2">
                    Loading...
                  </div>
                ) : (
                  categoryQuery.data?.map((category: Category) => (
                    <div
                      key={category.id}
                      onClick={() =>
                        setProduct({ ...product, categoryId: category.id })
                      }
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                        product.categoryId === category.id
                          ? "bg-[#edeefc] text-[#4f507f]"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center ${
                          product.categoryId === category.id
                            ? "bg-[#4f507f] text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        {product.categoryId === category.id && (
                          <Check size={12} />
                        )}
                      </div>
                      <span>{category.name}</span>
                    </div>
                  ))
                )}
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter material"
                value={product.material}
                onChange={(e) =>
                  setProduct({ ...product, material: e.target.value })
                }
              />
              {errors.material && (
                <p className="text-red-500 text-xs mt-1">{errors.material}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Not working yet)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>{" "}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hidden ">
          <h2 className="text-lg font-medium mb-4 text-[#4f507f]">Inventory</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="track-inventory"
                className="w-4 h-4 text-[#4f507f] bg-white rounded focus:ring-[#4f507f]"
              />
              <label
                htmlFor="track-inventory"
                className="text-sm text-gray-700"
              >
                Track inventory
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="continue-selling"
                className="w-4 h-4 bg-white text-[#4f507f] rounded focus:ring-[#4f507f]"
              />
              <label
                htmlFor="continue-selling"
                className="text-sm text-gray-700"
              >
                Continue selling when out of stock
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-[#4f507f] flex items-center">
            <span className="inline-block w-2 h-2 bg-[#4f507f] rounded-full mr-2"></span>
            Status
          </h2>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setProduct({ ...product, status: "DRAFT" })}
              className={`flex-1 px-3 sm:px-4 py-2 rounded-md text-sm ${
                product.status === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setProduct({ ...product, status: "PUBLISHED" })}
              className={`flex-1 px-3 sm:px-4 py-2 rounded-md text-sm ${
                product.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Published
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:gap-3">
          <button
            type="submit"
            className="flex-1 bg-[#4f507f] text-white py-2 px-4 rounded-md hover:bg-[#3e3f63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={saveProduct}
            disabled={productMutation.isPending}
          >
            {productMutation.isPending ? "Saving..." : "Save Product"}
          </button>
          <button
            type="button"
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Popups */}
      {isUploadPopupOpen && (
        <UploadPopup
          onSuccess={handleAddImage}
          onClose={() => setIsUploadPopupOpen(false)}
        />
      )}
      {varientImgPopUp && (
        <UploadPopup
          onSuccess={handleAddVarientImage}
          onClose={() => setVarientImgPopUp(false)}
        />
      )}
    </div>
  );
}
