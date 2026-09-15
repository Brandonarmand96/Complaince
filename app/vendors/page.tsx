'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/badges';
import { supabase } from '@/lib/supabase';
import { ORG_ID } from '@/lib/data';
import { cn } from '@/lib/utils';

const criticalityColors: Record<string, string> = {
  Critical: 'bg-destructive/15 text-destructive',
  High: 'bg-warning/15 text-warning',
  Medium: 'bg-primary/15 text-primary',
  Low: 'bg-muted text-muted-foreground',
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('vendors').select('*').eq('organization_id', ORG_ID).then(({ data }) => { setVendors(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  const expiringContracts = vendors.filter((v) => {
    if (!v.contract_end) return false;
    const days = (new Date(v.contract_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days < 90 && days > 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Vendor Management</h2>
          <p className="text-sm text-muted-foreground">Third-party risk, assessments, and contract tracking</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Vendor</Button>
      </div>

      {expiringContracts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm text-foreground"><strong>{expiringContracts.length}</strong> vendor contract(s) expiring within 90 days: {expiringContracts.map((v) => v.name).join(', ')}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v) => (
          <Card key={v.id} className="transition-all hover:shadow-md cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.service_provided}</p>
                </div>
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold', criticalityColors[v.criticality] || 'bg-muted')}>{v.criticality}</span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Business Owner</span><span className="font-medium">{v.business_owner}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Risk Rating</span><span className="font-medium">{v.risk_rating}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Contract End</span><span className={v.contract_end && new Date(v.contract_end) < new Date() ? 'text-destructive font-medium' : ''}>{v.contract_end ? new Date(v.contract_end).toLocaleDateString() : '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Security Review</span><span className={v.security_review_date && new Date(v.security_review_date) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) ? 'text-warning font-medium' : ''}>{v.security_review_date ? new Date(v.security_review_date).toLocaleDateString() : '—'}</span></div>
              </div>
              <div className="mt-3"><StatusBadge status={v.status} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
