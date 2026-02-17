"use client";

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('./LoginForm'), { ssr: false });

export const dynamicConfig = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm />;
}
