'use client';

import { Building2, Shield, Bell, Palette, Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Organization configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><div><CardTitle className="text-base">Organization Profile</CardTitle><CardDescription>Basic organization information</CardDescription></div></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Organization Name</Label><Input defaultValue="FinSecure Technologies Ltd." className="mt-1" /></div>
            <div><Label className="text-xs">Industry</Label><Input defaultValue="Financial Technology" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Country</Label><Input defaultValue="Singapore" className="mt-1" /></div>
              <div><Label className="text-xs">Employees</Label><Input defaultValue="450" className="mt-1" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /><div><CardTitle className="text-base">Risk Scoring Model</CardTitle><CardDescription>Likelihood × Impact scale configuration</CardDescription></div></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Likelihood Scale</Label><Input defaultValue="1-5" className="mt-1" /></div>
              <div><Label className="text-xs">Impact Scale</Label><Input defaultValue="1-5" className="mt-1" /></div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Low risk threshold', value: '1-6', color: 'bg-success/15 text-success' },
                { label: 'Medium risk threshold', value: '7-12', color: 'bg-warning/15 text-warning' },
                { label: 'High risk threshold', value: '13-25', color: 'bg-destructive/15 text-destructive' },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between rounded-lg border p-2">
                  <span className="text-xs">{t.label}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${t.color}`}>{t.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /><div><CardTitle className="text-base">Security Settings</CardTitle><CardDescription>Authentication and access policies</CardDescription></div></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label className="text-sm">Require MFA</Label><p className="text-xs text-muted-foreground">Multi-factor authentication for all users</p></div><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><div><Label className="text-sm">Session Timeout</Label><p className="text-xs text-muted-foreground">Auto-logout after inactivity</p></div><Input defaultValue="30 min" className="w-20" /></div>
            <div className="flex items-center justify-between"><div><Label className="text-sm">Password Policy</Label><p className="text-xs text-muted-foreground">Minimum length and complexity</p></div><Input defaultValue="12 chars" className="w-20" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><div><CardTitle className="text-base">Notifications</CardTitle><CardDescription>Alert and reminder preferences</CardDescription></div></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label className="text-sm">Email Alerts</Label><p className="text-xs text-muted-foreground">Critical findings and overdue tasks</p></div><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><div><Label className="text-sm">Weekly Digest</Label><p className="text-xs text-muted-foreground">Summary of compliance activity</p></div><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><div><Label className="text-sm">Evidence Expiry Reminders</Label><p className="text-xs text-muted-foreground">Notify before evidence expires</p></div><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><div><Label className="text-sm">Quiet Hours</Label><p className="text-xs text-muted-foreground">No notifications during off-hours</p></div><Switch /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
