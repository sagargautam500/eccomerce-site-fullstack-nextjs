// src/components/PaymentMethodSelector.tsx
"use client";

import { useState } from "react";
import { Loader2, CreditCard, Smartphone, Lock, Check } from "lucide-react";
import { CheckoutItem } from "@/types/checkoutItem";
import { User } from "@/types/user";
import { createCheckoutSession } from "@/actions/api/paymentApi";

interface Props {
  items: CheckoutItem[];
  user: User;
  shippingAddress: any;
}

type PaymentMethod = "card" | "esewa" | "khalti";

const paymentMethods = [
  {
    id: "card" as PaymentMethod,
    name: "Card",
    icon: CreditCard,
    color: "orange",
  },
  {
    id: "esewa" as PaymentMethod,
    name: "eSewa",
    icon: Smartphone,
    color: "green",
  },
  {
    id: "khalti" as PaymentMethod,
    name: "Khalti",
    icon: Smartphone,
    color: "purple",
  },
];

export default function PaymentMethodSelector({
  items,
  user,
  shippingAddress,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PaymentMethod>("card");

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    // Validate shipping address before checkout
    if (!shippingAddress) {
      setError("Please select a shipping address");
      setLoading(false);
      return;
    }

    try {
      const data = await createCheckoutSession(
        items,
        user,
        selected,
        shippingAddress
      );

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.error || err.message || "Payment failed");
      setLoading(false);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string }> =
      {
        orange: {
          bg: isSelected ? "bg-orange-100" : "bg-orange-50",
          border: isSelected ? "border-orange-500" : "border-orange-200",
          text: "text-orange-600",
        },
        green: {
          bg: isSelected ? "bg-green-100" : "bg-green-50",
          border: isSelected ? "border-green-500" : "border-green-200",
          text: "text-green-600",
        },
        purple: {
          bg: isSelected ? "bg-purple-100" : "bg-purple-50",
          border: isSelected ? "border-purple-500" : "border-purple-200",
          text: "text-purple-600",
        },
      };
    return colors[color] || colors.orange;
  };

  const selectedMethod = paymentMethods.find((m) => m.id === selected);

  return (
    <div className="space-y-4">
      {/* Payment Methods */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selected === method.id;
            const colors = getColorClasses(method.color, isSelected);

            return (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                disabled={loading}
                className={`
                  relative p-3 border-2 rounded-xl transition-all
                  ${colors.bg} ${colors.border}
                  ${loading ? "opacity-50" : "hover:shadow-md"}
                  flex flex-col items-center gap-1.5
                `}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <Icon className={`w-6 h-6 ${colors.text}`} />
                <span className="text-xs font-semibold text-gray-800">
                  {method.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay with {selectedMethod?.name}
          </>
        )}
      </button>
    </div>
  );
}
