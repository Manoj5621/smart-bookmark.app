"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function DashboardContent() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabaseClient().then((client: any) => {
      setSupabase(client);
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let dbChannel: any;
    let broadcastChannel: any;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      setBookmarks(data || []);

      dbChannel = supabase
        .channel("public:bookmarks")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "bookmarks" },
          (payload: any) => {
            setBookmarks((prev: any[]) => [payload.new, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "bookmarks" },
          (payload: any) => {
            setBookmarks((prev: any[]) =>
              prev.filter((b: any) => b.id !== payload.old.id)
            );
          }
        )
        .subscribe();

      broadcastChannel = supabase
        .channel("broadcast")
        .on(
          "broadcast",
          { event: "bookmark_deleted" },
          (payload: any) => {
            setBookmarks((prev: any[]) =>
              prev.filter((b: any) => b.id !== payload.id)
            );
          }
        )
        .subscribe();
    };

    init();

    return () => {
      dbChannel?.unsubscribe();
      broadcastChannel?.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {email}</h1>
      <ul>
        {bookmarks.map((b: any) => (
          <li key={b.id}>{b.title}</li>
        ))}
      </ul>
    </div>
  );
}
