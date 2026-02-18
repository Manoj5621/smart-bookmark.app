// This is a server component - no "use client" directive
// The entire page is simple HTML that redirects on the client

import { Suspense } from 'react';

function LoginForm() {
  return (
    <form method="GET" action="/api/auth/signin">
      <button 
        type="submit"
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105"
      >
        Sign in with Google
      </button>
    </form>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100">
      <p>Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 dark:from-yellow-900 dark:via-orange-900 dark:to-red-900">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <span className="text-4xl">🔖</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Smart Bookmark
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your bookmarks
          </p>
        </div>

        <Suspense fallback={<Loading />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
