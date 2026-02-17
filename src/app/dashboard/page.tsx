"use client";

import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('./DashboardContent'), { ssr: false });

export const dynamicConfig = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardContent />;
}
