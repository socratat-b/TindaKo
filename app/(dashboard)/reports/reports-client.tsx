'use client';

import dynamic from 'next/dynamic';

interface ReportsClientProps {
  userId: string;
}

const ReportsInterface = dynamic(
  () => import('@/components/reports/reports-interface'),
  { ssr: false }
);

export default function ReportsClient({ userId }: ReportsClientProps) {
  return <ReportsInterface userId={userId} />;
}
