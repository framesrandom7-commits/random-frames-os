import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, Clock, XCircle, FileText, Settings, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function WorkflowDashboard() {
  // Fetch Jobs Statistics
  const jobs: any[] = await (prisma as any).backgroundJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const queued = jobs.filter((j) => j.status === 'QUEUED').length;
  const running = jobs.filter((j) => j.status === 'RUNNING').length;
  const completed = jobs.filter((j) => j.status === 'COMPLETED').length;
  const failed = jobs.filter((j) => j.status === 'FAILED' || j.status === 'RETRYING').length;

  const totalProcessed = completed + failed;
  const successRate = totalProcessed > 0 ? Math.round((completed / totalProcessed) * 100) : 100;

  // Fetch Audit Logs (Recent Events)
  const auditLogs: any[] = await (prisma as any).auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true } } }
  });

  // Fetch Recent Notifications
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <PageHeader 
        title="Workflow Engine" 
        subtitle="Monitor automations, background jobs, and system events."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Success Rate</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-3xl font-bold text-white">{successRate}%</span>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Active Jobs</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-3xl font-bold text-white">{running}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Queued Jobs</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-3xl font-bold text-white">{queued}</span>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Failed Jobs</span>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-3xl font-bold text-white">{failed}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Background Jobs */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-400" /> Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {jobs.slice(0, 10).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{job.type}</span>
                      <span className="text-xs text-zinc-500">{formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
                    </div>
                    <Badge variant="outline" className={`
                      ${job.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : ''}
                      ${job.status === 'FAILED' ? 'text-red-500 border-red-500/20 bg-red-500/10' : ''}
                      ${job.status === 'QUEUED' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : ''}
                      ${job.status === 'RUNNING' ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' : ''}
                    `}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
                {jobs.length === 0 && <div className="text-zinc-500 text-sm">No jobs in queue.</div>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Audit Log / Events */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-zinc-400" /> Event Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                    <FileText className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white text-sm">{log.action}</span>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{log.entityType}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(log.createdAt, { addSuffix: true })}</span>
                        {log.user && (
                          <>
                            <span>•</span>
                            <span>{log.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && <div className="text-zinc-500 text-sm">No events logged yet.</div>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
