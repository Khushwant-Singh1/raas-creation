"use client";
import { useState, useEffect } from "react";
import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import { useCart } from "@/context/cart-context";
import OrderSummary from "@/components/order-summary";
import { useMutation } from "@tanstack/react-query";
import { Order, orderApi, OrderItems } from "@/lib/api/orders";

export default function PaymentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState("1234 5678 9801 0000");
  const [cardName, setCardName] = useState("Robert Fox");
  const [expiryDate, setExpiryDate] = useState("03/30");
  const [cvv, setCvv] = useState("•••");
  const [discountCode, setDiscountCode] = useState("FLAT50");
  const [addressId, setAddressId] = useState<string | null>(null);
  const { cartItems, clearCart } = useCart();
  const createOrderMutation = useMutation({
    mutationFn: (orderData: Order) => orderApi.createOrder(orderData),
    onSuccess: (data) => {
      clearCart();
      console.log(data)
      localStorage.setItem("lastOrderId", data.id || "");
      router.push("/order-confirmation");
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      alert("There was a problem processing your order. Please try again.");
    },
  });
  useEffect(() => {
    // Get addressId from localStorage or query params
    const storedAddressId = localStorage.getItem("selectedAddressId");
    if (storedAddressId) {
      setAddressId(storedAddressId);
    }
  }, []);
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  const subtotal = calculateSubtotal();
  const deliveryCharges = 40;
  const grandTotal = subtotal + deliveryCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert cart items to the OrderItems format required by the API
    const orderItems: OrderItems[] = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      priceAtOrder: item.price,
      productVariantId: `${item.id}_${item.color}_${item.size}`,
      color: item.color,
      productImage: item.image || "",
      productName: item.name,
      size: item.size,
    }));
    const orderData: Order = {
      userId: "yashsingh9651",
      items: orderItems,
      total: grandTotal,
      addressId: addressId||"adress123839df56",
      paid: paymentMethod !== "cod",
      status: "pending", // Assuming initial status is pending
      fulfillment: "pending", // Assuming initial status is pending
    };
    createOrderMutation.mutate(orderData);
  };
  const handleApplyDiscount = (code: string) => {
    // Implement discount logic here
    if (code === "Colors60") {
      return 0; // Replace with your actual discount calculation
    }
    return 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-medium mb-8">Payment Method</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10 max-w-xl">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#ffefd4] text-[#795d2a] flex items-center justify-center mb-1">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xs">Address</span>
            </div>

            <div className="flex-1 border-t border-dashed border-gray-300 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#795d2a] text-white flex items-center justify-center mb-1">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-xs">Payment Method</span>
            </div>

            <div className="flex-1 border-t border-dashed border-gray-300 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#ffefd4] text-[#795d2a] flex items-center justify-center mb-1">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs">Review</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {/* Payment Methods */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-6">
                    Select Payment Method
                  </h2>

                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-5 h-5 rounded-full border border-[#a08452] flex items-center justify-center mr-3">
                          {paymentMethod === "card" && (
                            <div className="w-3 h-3 rounded-full bg-[#a08452]"></div>
                          )}
                        </div>
                        <label
                          htmlFor="card-payment"
                          className="font-medium cursor-pointer"
                          onClick={() => setPaymentMethod("card")}
                        >
                          Debit/Credit Card
                        </label>
                        <input
                          type="radio"
                          id="card-payment"
                          name="payment-method"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="hidden"
                        />
                      </div>

                      {paymentMethod === "card" && (
                        <div className="pl-8">
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor="card-number"
                                className="block text-sm font-medium mb-1"
                              >
                                Card Number
                              </label>
                              <input
                                type="text"
                                id="card-number"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="card-name"
                                className="block text-sm font-medium mb-1"
                              >
                                Name On The Card
                              </label>
                              <input
                                type="text"
                                id="card-name"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label
                                  htmlFor="expiry-date"
                                  className="block text-sm font-medium mb-1"
                                >
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  id="expiry-date"
                                  value={expiryDate}
                                  onChange={(e) =>
                                    setExpiryDate(e.target.value)
                                  }
                                  placeholder="MM/YY"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="cvv"
                                  className="block text-sm font-medium mb-1"
                                >
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  id="cvv"
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]"
                                />
                              </div>
                            </div>

                            <div>
                              <Button
                                type="button"
                                className="w-full md:w-auto px-6 py-3 bg-[#a08452] hover:bg-[#8c703d] text-white"
                              >
                                Add Card
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-b pb-6">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full border border-[#a08452] flex items-center justify-center mr-3">
                          {paymentMethod === "upi" && (
                            <div className="w-3 h-3 rounded-full bg-[#a08452]"></div>
                          )}
                        </div>
                        <label
                          htmlFor="upi-payment"
                          className="font-medium cursor-pointer"
                          onClick={() => setPaymentMethod("upi")}
                        >
                          UPI (Google Pay, Paytm, Phonepe)
                        </label>
                        <input
                          type="radio"
                          id="upi-payment"
                          name="payment-method"
                          value="upi"
                          checked={paymentMethod === "upi"}
                          onChange={() => setPaymentMethod("upi")}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full border border-[#a08452] flex items-center justify-center mr-3">
                          {paymentMethod === "cod" && (
                            <div className="w-3 h-3 rounded-full bg-[#a08452]"></div>
                          )}
                        </div>
                        <label
                          htmlFor="cod-payment"
                          className="font-medium cursor-pointer"
                          onClick={() => setPaymentMethod("cod")}
                        >
                          Cash On Delivery
                        </label>
                        <input
                          type="radio"
                          id="cod-payment"
                          name="payment-method"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-[#a08452] hover:bg-[#8c703d] text-white"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending
                      ? "Processing..."
                      : "Place Order"}
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-80 shrink-0">
                <OrderSummary
                  subtotal={subtotal}
                  deliveryCharges={40}
                  discountCode="Colors60"
                  onApplyDiscount={handleApplyDiscount}
                  checkoutLink="/shipping-address"
                  buttonText=""
                />
              </div>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
