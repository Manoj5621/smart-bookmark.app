"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    getSupabaseClient().then((client) => {
      setSupabase(client);
    });
  }, []);

  const [email, setEmail] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      if (data) setBookmarks(data);
      setLoading(false);

      dbChannel = supabase
        .channel("bookmarks-db")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookmarks",
          },
          (payload: any) => {
            if (payload.new.user_id === user.id) {
              setBookmarks((prev) => [
                payload.new,
                ...prev,
              ]);
            }
          }
        )
        .subscribe();

      broadcastChannel = supabase.channel("bookmarks-broadcast");

      broadcastChannel.on(
        "broadcast",
        { event: "DELETE_BOOKMARK" },
        (wrapper: any) => {
          const payload = wrapper.payload;

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

  const addBookmark = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const url = (form.elements.namedItem("url") as HTMLInputElement).value;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      }
    ] as any);

    form.reset();
  };

  const deleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    await supabase.from("bookmarks").delete().eq("id", id);

    await supabase.channel("bookmarks-broadcast").send({
      type: "broadcast",
      event: "DELETE_BOOKMARK",
      payload: { id },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-fixed bg-cover bg-center" style={{ backgroundImage: `url('./bookmark.png')` }}>
      <div className="relative min-h-screen bg-black bg-opacity-40">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">SB</span>
              </div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Bookmarks
              </h1>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </header>

          {/* User Info */}
          <div className="mb-8">
            <p className="text-gray-300 text-lg">
              <span className="text-green-400">Logged in as:</span> {email}
            </p>
          </div>

          {/* Add Bookmark Form */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Bookmark</h2>
            <form onSubmit={addBookmark} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  name="title"
                  placeholder="Bookmark title"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <input
                  name="url"
                  placeholder="https://example.com"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Add Bookmark
              </button>
            </form>
          </div>

          {/* Bookmarks List */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Bookmarks</h2>
            <div className="space-y-4">
              {!loading && bookmarks.length === 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 text-center">
                  <p className="text-gray-400 text-lg">No bookmarks yet. Add your first bookmark above!</p>
                </div>
              )}

              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:bg-white/30 transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-white text-lg font-medium hover:text-blue-400 transition-colors duration-200">
                      {b.title}
                    </a>
                    <button
                      onClick={() => deleteBookmark(b.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}