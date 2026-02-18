import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get user from cookie
  const cookieHeader = request.headers.get("cookie") || "";
  
  const supabaseAuthToken = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("sb-access-token="))
    ?.split("=")[1];

  if (!supabaseAuthToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, url } = await request.json();

  const { data, error } = await supabase
    .from("bookmarks")
    .insert([{ title, url, user_id: user.id }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}
