"use client";

export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // ✅ SAFE for both dev + prod
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 dark:from-yellow-900 dark:via-orange-900 dark:to-red-900 animate-gradient">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <img
            src="/bookmark.png"
            alt="Bookmark Logo"
            className="w-20 h-20 mx-auto mb-4"
          />

          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Smart Bookmark
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your bookmarks
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}