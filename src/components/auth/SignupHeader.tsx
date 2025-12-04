import React from "react";

export default function SignupHeader() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
      <p className="mt-2 text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </a>
      </p>
    </div>
  );
}
