import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/lib/api';
export const FormField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(({ id, label, error, ...props }, ref) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium">{label}</label>
    <input {...props} id={id} ref={ref} aria-invalid={!!error} aria-describedby={error ? id + '-error' : undefined} className="h-11 w-full rounded-md border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    {error && <p id={id + '-error'} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>
));
FormField.displayName = 'FormField';
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, allowed: Path<T>[]) {
  if (error instanceof ApiError && error.fields) {
    for (const field of allowed) {
      const messages = error.fields[field];
      if (messages?.length) setError(field, { type: 'server', message: messages.join(' ') }, { shouldFocus: true });
    }
  }
  setError('root.server', { message: error instanceof ApiError ? error.message : 'Could not submit. Please retry.' });
}

