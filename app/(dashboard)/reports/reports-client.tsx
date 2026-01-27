'use client';

import dynamic from 'next/dynamic';

interface ReportsClientProps {
  storePhone: string;
}

const ReportsInterface = dynamic(
  () => import('@/components/reports/reports-interface'),
  { ssr: false }
);

export default function ReportsClient({ storePhone }: ReportsClientProps) {
  return <ReportsInterface storePhone={storePhone} />;
}
