import React from "react";

interface PageHeaderProps {
  showForgotPassword: boolean;
  onBackToSignin: () => void;
}

export default function PageHeader({ showForgotPassword, onBackToSignin }: PageHeaderProps) {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center">
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        {showForgotPassword ? "Reset your password" : "Sign in to your account"}
      </h2>
      
      <p className="mt-2 text-sm text-gray-600">
        {showForgotPassword ? (
          <>
            Remember your password?{' '}
            <button
              type="button"
              onClick={onBackToSignin}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <a href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500">
              Sign up
            </a>
          </>
        )}
      </p>
    </div>
  );
}
