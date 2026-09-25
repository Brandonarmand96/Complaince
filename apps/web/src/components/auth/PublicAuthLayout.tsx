import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
export function PublicAuthLayout({ title, description, children }: { eyebrow?: string; title: string; description: string; children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
    <section className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background"><ShieldCheck className="h-5 w-5 text-primary" /></span>ComplyOS</div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  </main>;
}
