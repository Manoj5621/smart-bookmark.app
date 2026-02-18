import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force this route to be dynamic - never analyze at build time
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get user from cookie
  const cookieHeader = request.headers.get("cookie") || "";
  
  // Check for auth token in cookies
  const supabaseAuthToken = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("sb-access-token="))
    ?.split("=")[1];

  if (!supabaseAuthToken) {
    return NextResponse.json({ user: null, bookmarks: [] });
  }

  // Set the session
  supabase.auth.setSession({
    access_token: supabaseAuthToken,
    refresh_token: cookieHeader
      .split("; ")
      .find((c) => c.startsWith("sb-refresh-token="))
      ?.split("=")[1] || "",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null, bookmarks: [] });
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    user: { email: user.email },
    bookmarks: bookmarks || [],
  });
}
