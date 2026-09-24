import { test, expect } from '@playwright/test';
test('shell navigation, field validation and real retry', async ({ page }, testInfo) => {
  let available = false;
  await page.route('http://127.0.0.1:4119/**', route => {
    if (route.request().url().endsWith('/auth/refresh')) return route.fulfill({ json: { accessToken: 'browser-test-token', expiresIn: 900, user: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner' } } });
    if (route.request().url().endsWith('/auth/me')) return route.fulfill({ json: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner', memberships: [] } });
    if (route.request().url().endsWith('/health/ready')) return route.fulfill({ status: available ? 200 : 503, json: { status: available ? 'ok' : 'unavailable', service: 'complyos-api' } });
    return route.fulfill({ json: { data: [], page: 1, limit: 5, total: 0 } });
  });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByText(/A required service is unavailable/)).toBeVisible();
  available = true;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('PostgreSQL and Redis are connected.')).toBeVisible();
  await page.getByRole('button', { name: 'Send sample job' }).click();
  await expect(page.getByText('Enter at least 2 characters.')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true });
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('link', { name: 'Evidence', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('login, registration and session management states', async ({ page }, testInfo) => {
  let authenticated = false;
  let revoked = false;
  await page.route('http://127.0.0.1:4119/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/auth/refresh')) return route.fulfill(authenticated ? { json: { accessToken: 'token', expiresIn: 900, user: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner' } } } : { status: 401, json: { error: { code: 'INVALID_REFRESH_TOKEN', message: 'The refresh session is invalid or expired.' }, requestId: 'test' } });
    if (url.endsWith('/auth/login')) { authenticated = true; return route.fulfill({ json: { accessToken: 'token', expiresIn: 900, user: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner' } } }); }
    if (url.endsWith('/auth/me')) return route.fulfill({ json: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner', memberships: [] } });
    if (url.includes('/api/v1/setup/jobs')) return route.fulfill({ json: { data: [], page: 1, limit: 5, total: 0 } });
    if (url.endsWith('/health/ready')) return route.fulfill({ json: { status: 'ok', service: 'complyos-api', checks: { database: 'ok', redis: 'ok' } } });
    if (url.endsWith('/auth/sessions') && route.request().method() === 'GET') return route.fulfill({ json: revoked ? [] : [{ id: '11111111-1111-4111-8111-111111111111', ipAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ComplyOS acceptance browser with a deliberately long device description', createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 10000).toISOString() }] });
    if (url.includes('/auth/sessions/') && route.request().method() === 'DELETE') { revoked = true; return route.fulfill({ status: 204, body: '' }); }
    return route.fulfill({ json: {} });
  });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true });
  await page.getByLabel('Work email').fill('owner@example.com');
  await page.getByLabel('Password').fill('correct horse battery staple');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await page.goto('/settings/sessions');
  await expect(page.getByText(/ComplyOS acceptance browser/)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('sessions.png'), fullPage: true });
  await page.getByRole('button', { name: 'Revoke' }).click();
  await expect(page.getByText('No active sessions remain.')).toBeVisible();
});
