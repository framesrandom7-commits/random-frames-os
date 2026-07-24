import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { verifySession as getSession } from '@/lib/auth';
import { StorageService } from '@/lib/storage/StorageService';
import { prisma } from '@/lib/prisma';
import StorageDashboardView from '@/components/storage/dashboard/storage-dashboard-view';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StoragePage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const settings = await prisma.integrationSettings.findFirst({
    where: { provider: 'GOOGLE_DRIVE', userId: session.userId }
  });

  let quota = null;
  if (settings && settings.refreshToken) {
    try {
      const storageService = new StorageService(session.userId);
      quota = await storageService.getStorageQuota();
    } catch (error) {
      console.error('Failed to fetch storage quota:', error);
      // We still render the dashboard even if quota fetch fails (transient error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Storage & DAM" 
        subtitle="Manage your connected cloud storage and digital assets" 
      />
      <StorageDashboardView settings={settings} quota={quota} />
    </div>
  );
}
