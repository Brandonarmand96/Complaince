'use client';

import { useEffect, useState, useMemo } from 'react';
import { Warehouse, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';
import { cn } from '@/lib/utils';

const criticalityColors: Record<string, string> = {
  Critical: 'bg-destructive/15 text-destructive',
  High: 'bg-warning/15 text-warning',
  Medium: 'bg-primary/15 text-primary',
  Low: 'bg-muted text-muted-foreground',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    supabase.from('assets').select('*').eq('organization_id', ORG_ID).then(({ data }) => { setAssets(data || []); setLoading(false); });
  }, []);

  const types = useMemo(() => ['all', ...new Set(assets.map((a) => a.type))], [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.hostname?.toLowerCase().includes(search.toLowerCase()) || a.ip_address?.includes(search);
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [assets, search, typeFilter]);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Asset Inventory</h2>
          <p className="text-sm text-muted-foreground">Hardware, software, cloud, and information assets</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Asset</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, hostname, or IP..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors', typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>{t === 'all' ? 'All' : t}</button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Owner</th>
                <th className="p-3 font-semibold">Environment</th>
                <th className="p-3 font-semibold">Classification</th>
                <th className="p-3 font-semibold">Criticality</th>
                <th className="p-3 font-semibold">IP / Hostname</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3 text-xs"><span className="rounded bg-muted px-2 py-0.5">{a.type}</span></td>
                  <td className="p-3 text-xs">{a.owner}</td>
                  <td className="p-3 text-xs">{a.environment}</td>
                  <td className="p-3 text-xs">{a.data_classification}</td>
                  <td className="p-3"><span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold', criticalityColors[a.criticality] || 'bg-muted')}>{a.criticality}</span></td>
                  <td className="p-3 text-xs font-mono text-muted-foreground">{a.ip_address || a.hostname || '—'}</td>
                  <td className="p-3 text-xs"><span className="rounded bg-success/15 px-2 py-0.5 text-success">{a.lifecycle_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
