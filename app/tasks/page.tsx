'use client';

import { useEffect, useState } from 'react';
import { KanbanSquare, Plus, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';
import { cn } from '@/lib/utils';

const columns = [
  { key: 'Backlog', title: 'Backlog', color: 'bg-muted' },
  { key: 'To do', title: 'To Do', color: 'bg-primary/20' },
  { key: 'In progress', title: 'In Progress', color: 'bg-warning/20' },
  { key: 'Blocked', title: 'Blocked', color: 'bg-destructive/20' },
  { key: 'In review', title: 'In Review', color: 'bg-primary/30' },
  { key: 'Completed', title: 'Completed', color: 'bg-success/20' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('tasks').select('*').eq('organization_id', ORG_ID).then(({ data }) => { setTasks(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  const tasksByStatus = columns.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.key),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">Remediation and work tracking board</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {tasksByStatus.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', col.color)} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</h3>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{col.tasks.length}</span>
            </div>
            <div className="space-y-2">
              {col.tasks.map((t) => {
                const isOverdue = t.status !== 'Completed' && t.due_date && new Date(t.due_date) < new Date();
                return (
                  <Card key={t.id} className="transition-all hover:shadow-md cursor-pointer">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium leading-tight">{t.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <PriorityBadge priority={t.priority} />
                        {isOverdue && <span className="flex items-center gap-0.5 text-[10px] text-destructive"><Clock className="h-2.5 w-2.5" /> Overdue</span>}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{t.owner}</span>
                        <div className="flex items-center gap-1">
                          {t.progress > 0 && (
                            <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                              <div className="h-full bg-primary" style={{ width: `${t.progress}%` }} />
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground">{t.progress}%</span>
                        </div>
                      </div>
                      {t.due_date && <p className="mt-1 text-[10px] text-muted-foreground">Due {new Date(t.due_date).toLocaleDateString()}</p>}
                    </CardContent>
                  </Card>
                );
              })}
              {col.tasks.length === 0 && <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground/50">Empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
