'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';

const roleColors: Record<string, string> = {
  'Organization Owner': 'bg-primary/15 text-primary',
  'Compliance Manager': 'bg-success/15 text-success',
  'Control Owner': 'bg-warning/15 text-warning',
  'Risk Manager': 'bg-destructive/15 text-destructive',
  'Auditor': 'bg-muted text-muted-foreground',
  'Policy Approver': 'bg-primary/15 text-primary',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('users').select('*').eq('organization_id', ORG_ID).then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">Team members and their roles</p>
        </div>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Invite User</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id} className="transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {u.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${roleColors[u.role] || 'bg-muted text-muted-foreground'}`}>{u.role}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{u.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
