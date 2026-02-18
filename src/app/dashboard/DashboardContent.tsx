"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Bookmark {
  id: number;
  title: string;
  url: string;
  created_at: string;
}

export default function DashboardContent() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status via API route
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        const data = await response.json();
        setEmail(data.user?.email || null);
        setBookmarks(data.bookmarks || []);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {email}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Bookmark</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          const url = (form.elements.namedItem('url') as HTMLInputElement).value;
          
          await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url }),
          });
          
          form.reset();
        }} className="flex gap-2">
          <input name="title" placeholder="Title" required className="border p-2 rounded" />
          <input name="url" placeholder="URL" type="url" required className="border p-2 rounded" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Bookmarks</h2>
      <ul>
        {bookmarks.map((b: Bookmark) => (
          <li key={b.id} className="border-b py-2">
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {b.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
