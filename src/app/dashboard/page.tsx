"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/* ================= TYPES ================= */

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
};

type DeleteBroadcastPayload = {
  id: string;
};

/* ================= COMPONENT ================= */

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= INIT + REALTIME ================= */

  useEffect(() => {
    let dbChannel: any;
    let broadcastChannel: any;

    const init = async () => {
      // 1️⃣ Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      // 2️⃣ Initial fetch
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setBookmarks(data);
      setLoading(false);

      // 3️⃣ Realtime INSERT (Postgres)
      dbChannel = supabase
        .channel("bookmarks-db")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookmarks",
          },
          (payload) => {
            if (payload.new.user_id === user.id) {
              setBookmarks((prev) => [
                payload.new as Bookmark,
                ...prev,
              ]);
            }
          }
        )
        .subscribe();

      // 4️⃣ Realtime DELETE (Broadcast – reliable)
      broadcastChannel = supabase.channel("bookmarks-broadcast");

      broadcastChannel.on(
        "broadcast",
        { event: "DELETE_BOOKMARK" },
        (wrapper: any) => {
          const payload = wrapper.payload as DeleteBroadcastPayload;

          setBookmarks((prev) =>
            prev.filter((b) => b.id !== payload.id)
          );
        }
      );

      broadcastChannel.subscribe();
    };

    init();

    return () => {
      if (dbChannel) supabase.removeChannel(dbChannel);
      if (broadcastChannel) supabase.removeChannel(broadcastChannel);
    };
  }, [router]);

  /* ================= ACTIONS ================= */

  // ➕ Add bookmark
  const addBookmark = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const url = (form.elements.namedItem("url") as HTMLInputElement).value;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    form.reset();
    // UI updates via realtime INSERT
  };

  // ❌ Delete bookmark (optimistic + broadcast)
  const deleteBookmark = async (id: string) => {
    // Optimistic UI
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    // Delete from DB
    await supabase.from("bookmarks").delete().eq("id", id);

    // Notify other tabs
    await supabase.channel("bookmarks-broadcast").send({
      type: "broadcast",
      event: "DELETE_BOOKMARK",
      payload: { id },
    });
  };

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <p className="text-green-600">Logged in as {email}</p>

      {/* Add bookmark */}
      <form onSubmit={addBookmark} className="space-x-2">
        <input
          name="title"
          placeholder="Bookmark title"
          required
          className="border p-1"
        />
        <input
          name="url"
          placeholder="https://example.com"
          required
          className="border p-1"
        />
        <button type="submit" className="bg-black text-white px-3 py-1">
          Add
        </button>
      </form>

      {/* Bookmark list */}
      <ul className="space-y-2">
        {!loading && bookmarks.length === 0 && (
          <li className="text-gray-500">No bookmarks yet</li>
        )}

        {bookmarks.map((b) => (
          <li key={b.id} className="flex justify-between border p-2">
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}