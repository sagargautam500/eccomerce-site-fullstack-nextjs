// src/app/help/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Smartphone,
  Building2,
  Code,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
  FileText,
  Settings,
  TestTube,
  Rocket,
  Mail,
  Phone,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string>("");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Payment Integration Help Center
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Everything you need to know about our multi-payment gateway system
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#payment-methods"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Payment Methods
            </a>
            <a
              href="#testing"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Testing Guide
            </a>
            <a
              href="#production"
              className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition"
            >
              Production Setup
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl mb-1">4</h3>
            <p className="text-gray-600 text-sm">Payment Methods</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl mb-1">100%</h3>
            <p className="text-gray-600 text-sm">Secure</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Zap className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl mb-1">5 min</h3>
            <p className="text-gray-600 text-sm">Setup Time</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <CheckCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-bold text-2xl mb-1">24/7</h3>
            <p className="text-gray-600 text-sm">Support</p>
          </div>
        </div>

        {/* Payment Methods Section */}
        <section id="payment-methods" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Available Payment Methods
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stripe */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Stripe (Card)</h3>
                </div>
                <p className="text-blue-100">International card payments</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Visa, Mastercard, Amex</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Global acceptance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Instant verification</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-semibold mb-1">
                    Test Card:
                  </p>
                  <p className="font-mono text-sm">4242 4242 4242 4242</p>
                </div>
              </div>
            </div>

            {/* eSewa */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">eSewa</h3>
                </div>
                <p className="text-green-100">Nepal&apos;s #1 digital wallet</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Most popular in Nepal</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Instant payment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">No setup fees</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-800 font-semibold mb-1">
                    Test Mobile:
                  </p>
                  <p className="font-mono text-sm">9806800001</p>
                  <p className="text-xs text-green-700 mt-1">MPIN: 1122</p>
                </div>
              </div>
            </div>

            {/* Khalti */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Khalti</h3>
                </div>
                <p className="text-purple-100">Digital wallet & banking</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <span className="text-sm">E-banking support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <span className="text-sm">Mobile banking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <span className="text-sm">ConnectIPS integration</span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-800 font-semibold mb-1">
                    Test Mobile:
                  </p>
                  <p className="font-mono text-sm">9800000000</p>
                  <p className="text-xs text-purple-700 mt-1">
                    MPIN: 1111 | OTP: 987654
                  </p>
                </div>
              </div>
            </div>

            {/* ConnectIPS */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">ConnectIPS</h3>
                </div>
                <p className="text-orange-100">Direct bank transfer</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span className="text-sm">All major banks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span className="text-sm">Secure bank-to-bank</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span className="text-sm">Demo mode available</span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-800 font-semibold mb-1">
                    Testing:
                  </p>
                  <p className="text-sm">Demo simulator available</p>
                  <p className="text-xs text-orange-700 mt-1">
                    No real credentials needed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testing Guide */}
        <section id="testing" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TestTube className="w-8 h-8 text-green-600" />
            Testing Environment Setup
          </h2>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-600" />
              Environment Variables (.env.local)
            </h3>

            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`# Database
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/db"

# App Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# ============================================
# STRIPE (Card Payments) - TEST MODE
# ============================================
STRIPE_SECRET_KEY="sk_test_51xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# ============================================
# ESEWA - TEST MODE
# ============================================
ESEWA_SECRET_KEY="8gBm/:&EnhH.1/q"
NEXT_PUBLIC_ESEWA_MERCHANT_CODE="EPAYTEST"
NEXT_PUBLIC_ESEWA_URL="https://uat.esewa.com.np/epay/main"
ESEWA_VERIFY_URL="https://uat.esewa.com.np/epay/transrec"
ESEWA_MERCHANT_CODE="EPAYTEST"

# ============================================
# KHALTI - TEST MODE
# ============================================
KHALTI_SECRET_KEY="test_secret_key_xxxxx"
NEXT_PUBLIC_KHALTI_PUBLIC_KEY="test_public_key_xxxxx"

# ============================================
# CONNECTIPS - DEMO MODE
# ============================================
NEXT_PUBLIC_CONNECTIPS_MERCHANT_ID="123456"
NEXT_PUBLIC_CONNECTIPS_APP_ID="APP_TEST_001"
NEXT_PUBLIC_CONNECTIPS_APP_NAME="MyTestApp"`}</code>
              </pre>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/db"\nNEXT_PUBLIC_BASE_URL="http://localhost:3000"\nSTRIPE_SECRET_KEY="sk_test_51xxxxx"\nSTRIPE_WEBHOOK_SECRET="whsec_xxxxx"\nESEWA_SECRET_KEY="8gBm/:&EnhH.1/q"\nNEXT_PUBLIC_ESEWA_MERCHANT_CODE="EPAYTEST"\nNEXT_PUBLIC_ESEWA_URL="https://uat.esewa.com.np/epay/main"\nESEWA_VERIFY_URL="https://uat.esewa.com.np/epay/transrec"\nESEWA_MERCHANT_CODE="EPAYTEST"\nKHALTI_SECRET_KEY="test_secret_key_xxxxx"\nNEXT_PUBLIC_KHALTI_PUBLIC_KEY="test_public_key_xxxxx"\nNEXT_PUBLIC_CONNECTIPS_MERCHANT_ID="123456"\nNEXT_PUBLIC_CONNECTIPS_APP_ID="APP_TEST_001"\nNEXT_PUBLIC_CONNECTIPS_APP_NAME="MyTestApp"`,
                  "test-env"
                )
              }
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {copiedText === "test-env" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copiedText === "test-env" ? "Copied!" : "Copy Configuration"}
            </button>
          </div>

          {/* Test Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Stripe Test Cards
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Card Number:</p>
                  <p className="font-mono font-semibold">4242 4242 4242 4242</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">
                    Expiry / CVC / ZIP:
                  </p>
                  <p className="font-mono">12/34 / 123 / 12345</p>
                </div>
              </div>
              <a
                href="https://stripe.com/docs/testing"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                More test cards
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                eSewa Test Account
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Mobile:</p>
                  <p className="font-mono font-semibold">9806800001</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Password / MPIN:</p>
                  <p className="font-mono">Nepal@123 / 1122</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Token:</p>
                  <p className="font-mono">123456</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Khalti Test Account
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Mobile:</p>
                  <p className="font-mono font-semibold">9800000000</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">MPIN / OTP:</p>
                  <p className="font-mono">1111 / 987654</p>
                </div>
              </div>
              <a
                href="https://test-admin.khalti.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                Get test keys
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                ConnectIPS Demo
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-orange-800 mb-2">
                    No credentials needed!
                  </p>
                  <p className="text-xs text-gray-600">
                    Click &quot;Simulate Successful Payment&quot; to test
                  </p>
                </div>
                <div className="bg-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-900">
                    ℹ️ Real ConnectIPS requires bank partnership
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Production Setup */}
        <section id="production" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-purple-600" />
            Production Setup
          </h2>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-6">
            <h3 className="text-2xl font-bold mb-4">Going Live Checklist</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Get Production API Keys</p>
                  <p className="text-sm text-purple-100">
                    Replace all test keys with live keys
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Configure Webhooks</p>
                  <p className="text-sm text-purple-100">
                    Add production URLs to gateways
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Test in Staging</p>
                  <p className="text-sm text-purple-100">
                    Verify all flows before launch
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Set Up Monitoring</p>
                  <p className="text-sm text-purple-100">
                    Track errors and transactions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              Production Environment Variables
            </h3>

            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`# Production URLs
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# STRIPE - LIVE MODE
STRIPE_SECRET_KEY="sk_live_51xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# ESEWA - PRODUCTION
ESEWA_SECRET_KEY="your_production_secret"
NEXT_PUBLIC_ESEWA_MERCHANT_CODE="your_merchant_code"
NEXT_PUBLIC_ESEWA_URL="https://esewa.com.np/epay/main"
ESEWA_VERIFY_URL="https://esewa.com.np/epay/transrec"

# KHALTI - LIVE MODE
KHALTI_SECRET_KEY="live_secret_key_xxxxx"
NEXT_PUBLIC_KHALTI_PUBLIC_KEY="live_public_key_xxxxx"

# CONNECTIPS - PRODUCTION
NEXT_PUBLIC_CONNECTIPS_MERCHANT_ID="your_merchant_id"
NEXT_PUBLIC_CONNECTIPS_APP_ID="your_app_id"
NEXT_PUBLIC_CONNECTIPS_URL="https://payment.connectips.com:7443/connectipswebgw/loginpage"`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Phone className="w-8 h-8 text-blue-600" />
            Support & Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold mb-2">Stripe</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a
                  href="mailto:support@stripe.com"
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Mail className="w-4 h-4" />
                  support@stripe.com
                </a>
                <a
                  href="https://stripe.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Globe className="w-4 h-4" />
                  Documentation
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold mb-2">eSewa</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a
                  href="mailto:merchant@esewa.com.np"
                  className="flex items-center gap-2 hover:text-green-600"
                >
                  <Mail className="w-4 h-4" />
                  merchant@esewa.com.np
                </a>
                <a
                  href="tel:015970019"
                  className="flex items-center gap-2 hover:text-green-600"
                >
                  <Phone className="w-4 h-4" />
                  01-5970019
                </a>
                <a
                  href="https://developer.esewa.com.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-green-600"
                >
                  <Globe className="w-4 h-4" />
                  Developer Portal
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold mb-2">Khalti</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a
                  href="mailto:support@khalti.com"
                  className="flex items-center gap-2 hover:text-purple-600"
                >
                  <Mail className="w-4 h-4" />
                  support@khalti.com
                </a>
                <a
                  href="tel:015970054"
                  className="flex items-center gap-2 hover:text-purple-600"
                >
                  <Phone className="w-4 h-4" />
                  01-5970054
                </a>
                <a
                  href="https://docs.khalti.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-purple-600"
                >
                  <Globe className="w-4 h-4" />
                  Documentation
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <div className="bg-orange-100 rounded-lg p-3 w-fit mb-4">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-bold mb-2">ConnectIPS</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact your bank
                </p>
                <p className="text-xs">
                  NIC Asia, Everest Bank, NMB, Himalayan Bank, etc.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            Common Issues & Solutions
          </h2>

          <div className="space-y-4">
            {[
              {
                issue: "eSewa ES104 Error (Invalid Signature)",
                solution:
                  "Check ESEWA_SECRET_KEY is correct. Restart dev server after changing environment variables. Ensure no extra spaces in .env.local file.",
                color: "green",
              },
              {
                issue: "Khalti Invalid Public Key Error",
                solution:
                  "Use test keys from test-admin.khalti.com. Format should be 'test_public_key_xxxxx' for test environment. Don't use old Khalti Checkout SDK keys.",
                color: "purple",
              },
              {
                issue: "Payment Not Redirecting",
                solution:
                  "Verify NEXT_PUBLIC_BASE_URL is correct. Check success/failure URLs are whitelisted in payment gateway dashboard. Use HTTPS in production.",
                color: "blue",
              },
              {
                issue: "Stripe Webhook Not Working",
                solution:
                  "Run 'stripe listen --forward-to localhost:3000/api/webhook' for local testing. Update webhook endpoint in Stripe dashboard for production.",
                color: "blue",
              },
              {
                issue: "Order Not Updating After Payment",
                solution:
                  "Check database connection. Verify order ID is passed correctly in redirect URLs. Check API logs for errors. Ensure webhook secrets are correct.",
                color: "red",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-${item.color}-50 border-l-4 border-${item.color}-500 rounded-r-xl p-6`}
              >
                <h4
                  className={`font-bold text-${item.color}-900 mb-2 flex items-center gap-2`}
                >
                  <AlertCircle className={`w-5 h-5 text-${item.color}-600`} />
                  {item.issue}
                </h4>
                <p className={`text-sm text-${item.color}-800`}>
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-600" />
            Quick Start in 5 Minutes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "1",
                title: "Install",
                description: "npm install",
                icon: "📦",
              },
              {
                step: "2",
                title: "Environment",
                description: "Copy .env.local config",
                icon: "⚙️",
              },
              {
                step: "3",
                title: "Database",
                description: "npx prisma db push",
                icon: "🗄️",
              },
              {
                step: "4",
                title: "Run",
                description: "npm run dev",
                icon: "🚀",
              },
              {
                step: "5",
                title: "Test",
                description: "Use test credentials",
                icon: "✅",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md text-center relative overflow-hidden"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            Security & Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="font-bold text-lg mb-2">Secure</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Input validation with Zod</li>
                <li>• Webhook signature verification</li>
                <li>• Environment variable protection</li>
                <li>• Server-side payment verification</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="font-bold text-lg mb-2">Fast</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Instant payment verification</li>
                <li>• Real-time order updates</li>
                <li>• Optimized database queries</li>
                <li>• Efficient error handling</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <CheckCircle className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="font-bold text-lg mb-2">Reliable</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Production-ready code</li>
                <li>• Comprehensive error handling</li>
                <li>• Database indexes for speed</li>
                <li>• TypeScript type safety</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                id: "faq1",
                question: "Do I need real merchant accounts for testing?",
                answer:
                  "No! All payment methods have test environments. Stripe, eSewa, and Khalti provide test credentials. ConnectIPS has a demo simulator that doesn't require any credentials.",
              },
              {
                id: "faq2",
                question: "How do I get production API keys?",
                answer:
                  "For Stripe: Sign up at stripe.com and get live keys from dashboard. For eSewa: Apply at esewa.com.np and complete merchant verification. For Khalti: Register at khalti.com and get approved. For ConnectIPS: Contact your bank that supports ConnectIPS.",
              },
              {
                id: "faq3",
                question: "Can I use this in production right away?",
                answer:
                  "Yes! Replace test credentials with production keys, update NEXT_PUBLIC_BASE_URL to your domain, configure webhooks in payment gateway dashboards, and deploy. Make sure to test thoroughly in staging first.",
              },
              {
                id: "faq4",
                question: "What if a payment fails?",
                answer:
                  "The system automatically handles failures. Orders are marked as 'failed', users see a friendly error page with retry options, and you can check logs for debugging. All payment gateways also provide transaction logs in their dashboards.",
              },
              {
                id: "faq5",
                question: "How do I test webhooks locally?",
                answer:
                  "For Stripe webhooks, use Stripe CLI: 'stripe listen --forward-to localhost:3000/api/webhook'. Copy the webhook secret and add it to your .env.local. eSewa and Khalti verify payments server-side so no webhook setup needed for testing.",
              },
              {
                id: "faq6",
                question: "Which payment method is most popular in Nepal?",
                answer:
                  "eSewa is the most widely used digital wallet in Nepal, followed by Khalti. For international customers, use Stripe (card payments). ConnectIPS covers direct bank transfers from all major Nepalese banks.",
              },
            ].map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-left">
                    {faq.question}
                  </span>
                  {openSection === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 shrink-0" />
                  )}
                </button>
                {openSection === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Get your payment system up and running in minutes!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2"
            >
              Try Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/sagargautam500"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
            >
              <Code className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
