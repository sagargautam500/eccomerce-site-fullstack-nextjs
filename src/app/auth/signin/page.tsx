// app/auth/signin/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Import components
import AlertMessage from "@/components/auth/AlertMessage";
import SigninForm from "@/components/auth/SigninForm";
import SocialLogin from "@/components/auth/SocialLogin";
import PageHeader from "@/components/auth/PageHeader";
import { SigninFormData, signinSchema } from "@/lib/zod";
import { handleCredentialsSignIn } from "@/actions/authAction";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function SigninPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" }>({ 
    text: "", 
    type: "error" 
  });

  const router = useRouter();

  // Sign in form
  const signinForm = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    mode: "onChange"
  });

  // Show message helper
  const showMessage = (text: string, type: "success" | "error" = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "error" }), 5000);
  };

  // Handle sign in
  const onSignin = async (data: SigninFormData) => {
    try {
      setLoading(true);
      await handleCredentialsSignIn(data.email.trim(), data.password);
    } catch (error) {
      showMessage((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password success (return to sign in)
  const handleForgotPasswordSuccess = () => {
    setShowForgotPassword(false);
    signinForm.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <PageHeader 
          showForgotPassword={showForgotPassword}
          onBackToSignin={() => setShowForgotPassword(false)}
        />

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Alert Messages */}
          <AlertMessage message={message} />

          {/* Forms */}
          {!showForgotPassword ? (
            <>
              <SigninForm
                form={signinForm}
                onSubmit={onSignin}
                loading={loading}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
              {/* Social Login */}
              <SocialLogin />
            </>
          ) : (
            <ForgotPasswordForm
              onSuccess={handleForgotPasswordSuccess}
              onShowMessage={showMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}