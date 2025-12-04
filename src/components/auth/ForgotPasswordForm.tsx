//src/components/auth/ForgotPasswordForm.tsx
import React, { useState } from "react";
import axios from "axios";

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onShowMessage: (text: string, type: "success" | "error") => void;
}

export default function ForgotPasswordForm({ onSuccess, onShowMessage }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Step 1: Check if email exists and send verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Invalid email format" });
      return;
    }

    try {
      setLoading(true);

      // Check if user exists and if exists send verification code
      const checkResponse = await axios.post<{ exists: boolean }>("/api/custom-auth/check-email", {
        email: email.trim(),
      });

      if (!checkResponse.data.exists) {
        setErrors({ email: "No account found with this email" });
        return;
      }

    

      onShowMessage("Verification code sent to your email!", "success");
      setStep("verify");
    } catch (err: any) {
      onShowMessage(err.response?.data?.error || "Failed to send verification code", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!code.trim()) {
      setErrors({ code: "Verification code is required" });
      return;
    }

    if (code.length !== 4) {
      setErrors({ code: "Code must be 4 digits" });
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/custom-auth/verify-forgotpp-code", {
        email: email.trim(),
        code: code.trim(),
      });

      onShowMessage("Email verified successfully!", "success");
      setStep("reset");
    } catch (err: any) {
      onShowMessage(err.response?.data?.error || "Invalid or expired code", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/custom-auth/forgot-password", {
        email: email.trim(),
        newPassword,
      });

      onShowMessage("Password reset successful! Redirecting to sign in...", "success");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      onShowMessage(err.response?.data?.error || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Enter Email */}
      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Enter your email address and we'll send you a verification code.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending code...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Verify Code */}
      {step === "verify" && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Enter the 4-digit verification code sent to <strong>{email}</strong>
            </p>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 text-center text-2xl tracking-widest focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0000"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Reset Password */}
      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Create a new password for your account
            </p>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Resetting password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}