"use client";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Login</h1>

      <button
        onClick={signInWithGoogle}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        Sign in with Google
      </button>
    </main>
  );
}