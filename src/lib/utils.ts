// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = "NPR"): string {
  return `${currency} ${amount.toLocaleString()}`;
}

// Calculate discount percentage
export function calculateDiscount(original: number, current: number): number {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}