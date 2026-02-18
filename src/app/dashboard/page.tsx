"use client";

import dynamic from 'next/dynamic';

const DashboardContent = dynamic(
  () => import('./DashboardContent'),
  { ssr: false, loading: () => <div className="p-6">Loading...</div> }
);

export default function DashboardPage() {
  return <DashboardContent />;
}
