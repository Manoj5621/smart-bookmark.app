"use client";

"use client";

import dynamic from 'next/dynamic';

const LoginForm = dynamic(
  () => import('./LoginFormContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div> }
);

export default function LoginPage() {
  return <LoginForm />;
}
