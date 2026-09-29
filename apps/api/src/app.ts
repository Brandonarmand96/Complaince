import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { HealthResponse, JobSummary, PageResult } from '@complyos/contracts';
import { createLogger } from '@complyos/runtime/logger';
import { IdempotencyConflict, type HealthInput, type JobPage } from '@complyos/runtime/jobs';
import { AccountUnavailable, EmailAlreadyRegistered, InvalidCredentials, InvalidInvitationToken, InvalidPasswordResetToken, InvalidRefreshToken, InvalidVerificationToken, InvitationForbidden, type AuthConfig, type AuthResult, type MfaRequiredResult } from '@complyos/runtime/auth';
import { SecurityPolicyError } from '@complyos/runtime/security';
import { TenantAccessDenied } from '@complyos/runtime/authorization';
import type { governanceApi } from '@complyos/runtime/governance-api';
import { ConcurrencyConflict } from '@complyos/runtime/governance';
import type { organizationStore } from '@complyos/runtime/organizations';
import type { businessUnitStore } from '@complyos/runtime/business-units';
import type { departmentStore } from '@complyos/runtime/departments';
import type { locationStore } from '@complyos/runtime/locations';
import type { frameworkStore } from '@complyos/runtime/frameworks';
import { authenticateAccessToken, createRateLimiter, HttpError, errorHandler, parseJobQuery, requestLogging, validateBody } from './http.js';
import { BusinessUnitCreateDto, BusinessUnitPatchDto, DepartmentCreateDto, DepartmentPatchDto, LocationCreateDto, LocationPatchDto, FrameworkCreateDto, FrameworkPatchDto, CommentCreateDto, CommentEditDto, DisableOrganizationDto, EmailVerificationConsumeDto, EmailVerificationRequestDto, HealthJobDto, InvitationAcceptDto, InvitationAcceptNewDto, InvitationCreateDto, LoginDto, MfaChallengeDto, MfaCodeDto, MfaResetRequestDto, OrganizationCreateDto, OrganizationPatchDto, PasswordResetCompleteDto, PasswordResetRequestDto, ReactionDto, RefreshDto, RegisterDto, SubscriptionDto, SwitchOrganizationDto, UserStatusDto, WorkflowDefinitionDto, WorkflowTransitionDto } from './dto.js';
import { openapi } from './openapi.js';
export interface AppDependencies {
  checkDatabase: () => Promise<unknown>;
  checkRedis: () => Promise<unknown>;
  submitJob: (input: HealthInput, key: string) => Promise<JobSummary>;
  listJobs: (input: JobPage) => Promise<PageResult<JobSummary>>;
  webOrigin: string;
  nodeEnv: string;
  authConfig: AuthConfig;
  auth: {
    register: (input: RegisterDto, context?: { ipAddress?: string; userAgent?: string }) => Promise<AuthResult>;
    login: (input: LoginDto, context?: { ipAddress?: string; userAgent?: string }) => Promise<AuthResult | MfaRequiredResult>;
    refresh: (token: string) => Promise<AuthResult>;
    logout: (token: string) => Promise<void>;
    me: (userId: string, sessionId: string) => Promise<unknown>;
    sessions: (userId: string) => Promise<unknown[]>;
    revokeSession: (userId: string, sessionId: string) => Promise<boolean>;
    validateAccess: (userId: string, sessionId: string) => Promise<void>;
    requestEmailVerification: (email: string) => Promise<void>;
    consumeEmailVerification: (token: string) => Promise<{ verified: true }>;
    requestPasswordReset: (email: string) => Promise<void>;
    completePasswordReset: (token: string, password: string) => Promise<{ reset: true }>;
    assignableRoles: (userId: string, organizationId: string) => Promise<unknown[]>;
    createInvitation: (userId: string, input: InvitationCreateDto) => Promise<unknown>;
    resendInvitation: (userId: string, invitationId: string) => Promise<{ resent: true }>;
    acceptInvitation: (userId: string, token: string) => Promise<unknown>;
    invitationDetails: (token: string) => Promise<unknown>;
    acceptNewInvitation: (token: string, input: { displayName: string; password: string }, context?: { ipAddress?: string; userAgent?: string }) => Promise<AuthResult>;
    completeMfaChallenge: (challengeToken: string, code: string, context?: { ipAddress?: string; userAgent?: string }) => Promise<AuthResult>;
    switchOrganization: (userId: string, sessionId: string, organizationId: string) => Promise<{ accessToken: string; expiresIn: number; activeOrganizationId: string }>;
  };
  security: {
    transitionUserStatus: (actorUserId: string, organizationId: string, targetUserId: string, status: string) => Promise<unknown>;
    beginMfaEnrollment: (userId: string, email: string) => Promise<unknown>;
    confirmMfaEnrollment: (userId: string, code: string) => Promise<unknown>;
    requestMfaReset: (userId: string, organizationId: string) => Promise<unknown>;
    approveMfaReset: (userId: string, requestId: string) => Promise<unknown>;
  };
  governance?: ReturnType<typeof governanceApi>;
  organizations?: ReturnType<typeof organizationStore>;
  businessUnits?: ReturnType<typeof businessUnitStore>;
  departments?: ReturnType<typeof departmentStore>;
  locations?: ReturnType<typeof locationStore>;
  frameworks?: ReturnType<typeof frameworkStore>;
  logger?: ReturnType<typeof createLogger>;
}
export function createApp(deps: AppDependencies) {
  const app = express();
  const logger = deps.logger ?? createLogger();
  app.disable('x-powered-by');
  app.use(requestLogging(logger));
  // Bind loopback at startup, reject DNS rebinding and foreign browser origins.
  app.use((request, response, next) => {
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(request.hostname)) return next(new HttpError(403, 'HOST_REJECTED', 'Use the local API address.'));
    const origin = request.get('Origin');
    if (origin && origin !== deps.webOrigin) return next(new HttpError(403, 'ORIGIN_REJECTED', 'Origin is not allowed.'));
    response.setHeader('Vary', 'Origin');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, Authorization');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    }
    if (request.method === 'OPTIONS') { response.sendStatus(204); return; }
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.get('/health/live', (_request, response) => {
    response.json({ status: 'ok', service: 'complyos-api' } satisfies HealthResponse);
  });
  app.get('/health/ready', async (_request, response) => {
    const results = await Promise.allSettled([deps.checkDatabase(), deps.checkRedis()]);
    const checks = { database: results[0].status === 'fulfilled' ? 'ok' : 'unavailable', redis: results[1].status === 'fulfilled' ? 'ok' : 'unavailable' } as const;
    const ready = checks.database === 'ok' && checks.redis === 'ok';
    response.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable', service: 'complyos-api', checks } satisfies HealthResponse);
  });
  app.get('/api/openapi.json', (_request, response) => response.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { swaggerOptions: { validatorUrl: null } }));
  const cookieName = 'complyos_refresh';
  const cookieOptions = { httpOnly: true, secure: deps.nodeEnv === 'production', sameSite: 'lax' as const, path: '/auth', maxAge: deps.authConfig.refreshTtlSeconds * 1000 };
  const refreshCookie = (request: express.Request) => request.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  const sendAuth = (response: express.Response, result: AuthResult, status = 200) => {
    response.cookie(cookieName, result.refreshToken, cookieOptions);
    const { refreshToken: _secret, ...body } = result;
    response.status(status).json(body);
  };
  const requestContext = (request: express.Request) => ({ ipAddress: request.ip, userAgent: request.get('User-Agent') });
  const authLimit = createRateLimiter(10, 60_000);
  const strictAuthLimit = createRateLimiter(5, 60_000);
  const requireAuth = authenticateAccessToken(deps.authConfig, identity => deps.auth.validateAccess(identity.userId, identity.sessionId));
  app.post('/auth/register', strictAuthLimit, validateBody(RegisterDto), async (request, response) => {
    try { sendAuth(response, await deps.auth.register(response.locals.body as RegisterDto, requestContext(request)), 201); }
    catch (error) {
      if (error instanceof EmailAlreadyRegistered) throw new HttpError(409, 'EMAIL_UNAVAILABLE', 'An account cannot be created with those details.');
      throw error;
    }
  });
  app.post('/auth/login', authLimit, validateBody(LoginDto), async (request, response) => {
    try { const result = await deps.auth.login(response.locals.body as LoginDto, requestContext(request)); if ('mfaRequired' in result) response.json(result); else sendAuth(response, result); }
    catch (error) {
      if (error instanceof InvalidCredentials || error instanceof AccountUnavailable) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      throw error;
    }
  });
  app.post('/auth/mfa/challenge', strictAuthLimit, validateBody(MfaChallengeDto), async (request, response) => { const body = response.locals.body as MfaChallengeDto; try { sendAuth(response, await deps.auth.completeMfaChallenge(body.challengeToken, body.code, requestContext(request))); } catch (error) { if (error instanceof InvalidCredentials) throw new HttpError(401, 'INVALID_MFA_CODE', 'The authentication code is invalid or expired.'); throw error; } });
  app.post('/auth/mfa/enroll', requireAuth, async (_request, response) => { const identity = response.locals.auth as { userId: string; sessionId: string }; const profile = await deps.auth.me(identity.userId, identity.sessionId); response.json(await deps.security.beginMfaEnrollment(identity.userId, (profile as { email: string }).email)); });
  app.post('/auth/mfa/confirm', requireAuth, validateBody(MfaCodeDto), async (_request, response) => { try { response.json(await deps.security.confirmMfaEnrollment((response.locals.auth as { userId: string }).userId, (response.locals.body as MfaCodeDto).code)); } catch (error) { if (error instanceof SecurityPolicyError) throw new HttpError(400, 'INVALID_MFA_CODE', error.message); throw error; } });
  app.post('/auth/mfa/reset-requests', requireAuth, validateBody(MfaResetRequestDto), async (_request, response) => { response.status(201).json(await deps.security.requestMfaReset((response.locals.auth as { userId: string }).userId, (response.locals.body as MfaResetRequestDto).organizationId)); });
  app.post('/auth/mfa/reset-requests/:id/approve', requireAuth, async (request, response) => { try { response.json(await deps.security.approveMfaReset((response.locals.auth as { userId: string }).userId, String(request.params.id))); } catch (error) { if (error instanceof TenantAccessDenied) throw new HttpError(403, 'FORBIDDEN', 'Only the designated approver can approve this request.'); throw error; } });
  app.post('/auth/switch-organization', requireAuth, validateBody(SwitchOrganizationDto), async (_request, response) => { const identity = response.locals.auth as { userId: string; sessionId: string }; try { response.json(await deps.auth.switchOrganization(identity.userId, identity.sessionId, (response.locals.body as SwitchOrganizationDto).organizationId)); } catch (error) { if (error instanceof InvitationForbidden) throw new HttpError(403, 'FORBIDDEN', 'An active membership is required.'); throw error; } });
  app.post('/auth/refresh', async (request, response) => {
    const token = refreshCookie(request) ?? (request.body as Partial<RefreshDto> | undefined)?.refreshToken;
    if (!token || typeof token !== 'string') throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid or expired.');
    try { sendAuth(response, await deps.auth.refresh(token)); }
    catch (error) {
      if (error instanceof InvalidRefreshToken) throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'The refresh session is invalid or expired.');
      throw error;
    }
  });
  app.get('/auth/verify', requireAuth, (_request, response) => response.json({ authenticated: true, userId: (response.locals.auth as { userId: string }).userId }));
  app.post('/auth/logout', async (request, response) => {
    const token = refreshCookie(request);
    if (token) await deps.auth.logout(token);
    response.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
    response.sendStatus(204);
  });
  app.get('/auth/me', requireAuth, async (_request, response) => {
    const identity = response.locals.auth as { userId: string; sessionId: string };
    response.json(await deps.auth.me(identity.userId, identity.sessionId));
  });
  app.get('/auth/sessions', requireAuth, async (_request, response) => {
    const identity = response.locals.auth as { userId: string };
    response.json(await deps.auth.sessions(identity.userId));
  });
  app.delete('/auth/sessions/:id', requireAuth, async (request, response) => {
    const identity = response.locals.auth as { userId: string };
    const sessionId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) throw new HttpError(400, 'VALIDATION_ERROR', 'Session ID is invalid.');
    if (!(await deps.auth.revokeSession(identity.userId, sessionId))) throw new HttpError(404, 'SESSION_NOT_FOUND', 'Session not found.');
    response.sendStatus(204);
  });
  app.post('/auth/email-verification/request', strictAuthLimit, validateBody(EmailVerificationRequestDto), async (_request, response) => {
    await deps.auth.requestEmailVerification((response.locals.body as EmailVerificationRequestDto).email);
    response.status(202).json({ accepted: true });
  });
  app.post('/auth/email-verification/consume', strictAuthLimit, validateBody(EmailVerificationConsumeDto), async (_request, response) => {
    try { response.json(await deps.auth.consumeEmailVerification((response.locals.body as EmailVerificationConsumeDto).token)); }
    catch (error) { if (error instanceof InvalidVerificationToken) throw new HttpError(400, 'INVALID_VERIFICATION_TOKEN', 'This verification link is invalid or expired.'); throw error; }
  });
  app.post('/auth/password-reset/request', strictAuthLimit, validateBody(PasswordResetRequestDto), async (_request, response) => {
    await deps.auth.requestPasswordReset((response.locals.body as PasswordResetRequestDto).email);
    response.status(202).json({ accepted: true });
  });
  app.post('/auth/password-reset/complete', strictAuthLimit, validateBody(PasswordResetCompleteDto), async (_request, response) => {
    const body = response.locals.body as PasswordResetCompleteDto;
    try { response.json(await deps.auth.completePasswordReset(body.token, body.password)); }
    catch (error) { if (error instanceof InvalidPasswordResetToken) throw new HttpError(400, 'INVALID_PASSWORD_RESET_TOKEN', 'This reset link is invalid or expired.'); throw error; }
  });
  app.get('/invitations/roles', requireAuth, async (request, response) => {
    const organizationId = typeof request.query.organizationId === 'string' ? request.query.organizationId : '';
    if (!/^[0-9a-f-]{36}$/i.test(organizationId)) throw new HttpError(400, 'VALIDATION_ERROR', 'Organization ID is invalid.');
    try { response.json(await deps.auth.assignableRoles((response.locals.auth as { userId: string }).userId, organizationId)); }
    catch (error) { if (error instanceof InvitationForbidden) throw new HttpError(403, 'INVITATION_FORBIDDEN', 'You cannot invite users to this organization.'); throw error; }
  });
  app.post('/invitations', requireAuth, validateBody(InvitationCreateDto), async (_request, response) => {
    try { response.status(201).json(await deps.auth.createInvitation((response.locals.auth as { userId: string }).userId, response.locals.body as InvitationCreateDto)); }
    catch (error) { if (error instanceof InvitationForbidden) throw new HttpError(403, 'INVITATION_FORBIDDEN', 'One or more selected roles cannot be assigned.'); throw error; }
  });
  app.post('/invitations/:id/resend', requireAuth, async (request, response) => {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(400, 'VALIDATION_ERROR', 'Invitation ID is invalid.');
    try { response.json(await deps.auth.resendInvitation((response.locals.auth as { userId: string }).userId, id)); }
    catch (error) { if (error instanceof InvitationForbidden) throw new HttpError(403, 'INVITATION_FORBIDDEN', 'You cannot resend this invitation.'); if (error instanceof InvalidInvitationToken) throw new HttpError(404, 'INVITATION_NOT_FOUND', 'Invitation not found.'); throw error; }
  });
  app.post('/invitations/accept', requireAuth, validateBody(InvitationAcceptDto), async (_request, response) => {
    try { response.json(await deps.auth.acceptInvitation((response.locals.auth as { userId: string }).userId, (response.locals.body as InvitationAcceptDto).token)); }
    catch (error) { if (error instanceof InvalidInvitationToken) throw new HttpError(400, 'INVALID_INVITATION_TOKEN', 'This invitation is invalid, expired, or intended for another account.'); throw error; }
  });
  app.post('/invitations/preview', strictAuthLimit, validateBody(InvitationAcceptDto), async (_request, response) => { try { response.json(await deps.auth.invitationDetails((response.locals.body as InvitationAcceptDto).token)); } catch (error) { if (error instanceof InvalidInvitationToken) throw new HttpError(400, 'INVALID_INVITATION_TOKEN', 'This invitation is invalid or expired.'); throw error; } });
  app.post('/invitations/accept-new', strictAuthLimit, validateBody(InvitationAcceptNewDto), async (request, response) => { const body = response.locals.body as InvitationAcceptNewDto; try { sendAuth(response, await deps.auth.acceptNewInvitation(body.token, body, requestContext(request)), 201); } catch (error) { if (error instanceof InvalidInvitationToken) throw new HttpError(400, 'INVALID_INVITATION_TOKEN', 'This invitation is invalid or expired.'); if (error instanceof EmailAlreadyRegistered) throw new HttpError(409, 'ACCOUNT_EXISTS', 'Sign in to accept this invitation.'); if (error instanceof SecurityPolicyError) throw new HttpError(400, 'PASSWORD_POLICY', error.message); throw error; } });
  app.post('/users/:id/status', requireAuth, validateBody(UserStatusDto), async (request, response) => { const body = response.locals.body as UserStatusDto; try { response.json(await deps.security.transitionUserStatus((response.locals.auth as { userId: string }).userId, body.organizationId, String(request.params.id), body.status)); } catch (error) { if (error instanceof TenantAccessDenied) throw new HttpError(403, 'FORBIDDEN', 'Permission is required.'); if (error instanceof SecurityPolicyError) throw new HttpError(409, 'INVALID_STATUS_TRANSITION', error.message); throw error; } });
  const governance = () => { if (!deps.governance) throw new HttpError(503, 'GOVERNANCE_UNAVAILABLE', 'Governance services are unavailable.'); return deps.governance; };
  const identity = (response: express.Response) => response.locals.auth as { userId: string; sessionId: string };
  app.post('/api/v1/platform/organizations/:id/disable', requireAuth, validateBody(DisableOrganizationDto), async (request, response) => { try { const auth = identity(response); response.json(await governance().disableOrganization(auth.userId, String(request.params.id), (response.locals.body as DisableOrganizationDto).reason)); } catch (error) { if (error instanceof TenantAccessDenied) throw new HttpError(403,'FORBIDDEN','Platform administrator authority is required.'); throw error; } });
  app.put('/api/v1/platform/organizations/:id/subscription', requireAuth, validateBody(SubscriptionDto), async (request, response) => { try { const auth = identity(response); response.json(await governance().updateSubscription(auth.userId, String(request.params.id), response.locals.body as SubscriptionDto)); } catch (error) { if (error instanceof TenantAccessDenied) throw new HttpError(403,'FORBIDDEN','Platform administrator authority is required.'); throw error; } });
  app.get('/api/v1/audit-logs', requireAuth, async (request, response) => { const auth = identity(response); try { response.json(await governance().listAudit(auth.userId, auth.sessionId, { action: typeof request.query.action==='string'?request.query.action:undefined, resourceType: typeof request.query.resourceType==='string'?request.query.resourceType:undefined, actorUserId: typeof request.query.actorUserId==='string'?request.query.actorUserId:undefined, limit: typeof request.query.limit==='string'?Number(request.query.limit):undefined, before: typeof request.query.before==='string'?new Date(request.query.before):undefined })); } catch (error) { if (error instanceof TenantAccessDenied) throw new HttpError(403,'FORBIDDEN','Audit permission is required.'); throw error; } });
  app.get('/api/v1/workflows', requireAuth, async (_request,response)=>{ const auth=identity(response); response.json(await governance().listWorkflows(auth.userId,auth.sessionId)); });
  app.post('/api/v1/workflows', requireAuth, validateBody(WorkflowDefinitionDto), async (_request,response)=>{ const auth=identity(response); try { response.status(201).json(await governance().saveWorkflow(auth.userId,auth.sessionId,response.locals.body as WorkflowDefinitionDto)); } catch(error) { if(error instanceof TenantAccessDenied) throw new HttpError(403,'FORBIDDEN','Organization management permission is required.'); throw error; } });
  app.get('/api/v1/approvals', requireAuth, async (_request,response)=>{ const auth=identity(response); response.json(await governance().approvals(auth.userId,auth.sessionId)); });
  app.post('/api/v1/approvals/:id/transition', requireAuth, validateBody(WorkflowTransitionDto), async (request,response)=>{ const auth=identity(response); try { response.json(await governance().transition(auth.userId,auth.sessionId,String(request.params.id),response.locals.body as WorkflowTransitionDto)); } catch(error) { if(error instanceof ConcurrencyConflict) throw new HttpError(409,'CONCURRENCY_CONFLICT',error.message); throw error; } });
  app.get('/api/v1/comments', requireAuth, async (request,response)=>{ const auth=identity(response); const resourceType=String(request.query.resourceType??''); const resourceId=String(request.query.resourceId??''); if(!resourceType || !/^[0-9a-f-]{36}$/i.test(resourceId)) throw new HttpError(400,'VALIDATION_ERROR','A valid resource type and ID are required.'); response.json(await governance().listComments(auth.userId,auth.sessionId,{resourceType,resourceId,external:request.query.external==='true'})); });
  app.post('/api/v1/comments', requireAuth, validateBody(CommentCreateDto), async (_request,response)=>{ const auth=identity(response); response.status(201).json(await governance().createComment(auth.userId,auth.sessionId,response.locals.body as CommentCreateDto)); });
  app.patch('/api/v1/comments/:id', requireAuth, validateBody(CommentEditDto), async (request,response)=>{ const auth=identity(response); await governance().editComment(auth.userId,auth.sessionId,String(request.params.id),(response.locals.body as CommentEditDto).body); response.sendStatus(204); });
  app.post('/api/v1/comments/:id/reactions', requireAuth, validateBody(ReactionDto), async (request,response)=>{ const auth=identity(response); response.json(await governance().toggleReaction(auth.userId,auth.sessionId,String(request.params.id),(response.locals.body as ReactionDto).emoji)); });
  const organizations=()=>{if(!deps.organizations)throw new HttpError(503,'ORGANIZATIONS_UNAVAILABLE','Organization services are unavailable.');return deps.organizations;};
  app.get('/api/v1/organizations',requireAuth,async(request,response)=>{const auth=identity(response);const page=Number(request.query.page??1);const limit=Number(request.query.limit??20);if(!Number.isInteger(page)||page<1||page>10000||!Number.isInteger(limit)||limit<1||limit>100)throw new HttpError(400,'VALIDATION_ERROR','Page or limit is outside the allowed range.');try{response.json(await organizations().list(auth.userId,auth.sessionId,{page,limit}));}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw error;}});
  app.post('/api/v1/organizations',requireAuth,validateBody(OrganizationCreateDto),async(_request,response)=>{const auth=identity(response);try{response.status(201).json(await organizations().create(auth.userId,auth.sessionId,response.locals.body as OrganizationCreateDto,response.locals.requestId));}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission is required.');throw error;}});
  app.get('/api/v1/organizations/:id',requireAuth,async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Organization ID is invalid.');const auth=identity(response);try{const record=await organizations().detail(auth.userId,auth.sessionId,id);if(!record)throw new HttpError(404,'ORGANIZATION_NOT_FOUND','Organization not found.');response.json(record);}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw error;}});
  app.patch('/api/v1/organizations/:id',requireAuth,validateBody(OrganizationPatchDto),async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Organization ID is invalid.');const auth=identity(response);try{response.json(await organizations().update(auth.userId,auth.sessionId,id,response.locals.body as OrganizationPatchDto,response.locals.requestId));}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission is required.');if(error instanceof ConcurrencyConflict)throw new HttpError(409,'CONCURRENCY_CONFLICT',error.message);throw error;}});
  const businessUnits=()=>{if(!deps.businessUnits)throw new HttpError(503,'BUSINESS_UNITS_UNAVAILABLE','Business unit services are unavailable.');return deps.businessUnits;};
  app.get('/api/v1/business-units',requireAuth,async(request,response)=>{const auth=identity(response);const page=Number(request.query.page??1);const limit=Number(request.query.limit??20);if(!Number.isInteger(page)||page<1||page>10000||!Number.isInteger(limit)||limit<1||limit>100)throw new HttpError(400,'VALIDATION_ERROR','Page or limit is outside the allowed range.');try{response.json(await businessUnits().list(auth.userId,auth.sessionId,{page,limit}));}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw error;}});
  app.post('/api/v1/business-units',requireAuth,validateBody(BusinessUnitCreateDto),async(_request,response)=>{const auth=identity(response);try{response.status(201).json(await businessUnits().create(auth.userId,auth.sessionId,response.locals.body as BusinessUnitCreateDto,response.locals.requestId));}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission and valid tenant links are required.');throw error;}});
  app.get('/api/v1/business-units/:id',requireAuth,async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Business unit ID is invalid.');const auth=identity(response);try{const record=await businessUnits().detail(auth.userId,auth.sessionId,id);if(!record)throw new HttpError(404,'BUSINESS_UNIT_NOT_FOUND','Business unit not found.');response.json(record);}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw error;}});
  app.patch('/api/v1/business-units/:id',requireAuth,validateBody(BusinessUnitPatchDto),async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Business unit ID is invalid.');const auth=identity(response);try{response.json(await businessUnits().update(auth.userId,auth.sessionId,id,response.locals.body as BusinessUnitPatchDto,response.locals.requestId));}catch(error){if(error instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission and valid tenant links are required.');if(error instanceof ConcurrencyConflict)throw new HttpError(409,'CONCURRENCY_CONFLICT',error.message);throw error;}});
  const departments=()=>{if(!deps.departments)throw new HttpError(503,'DEPARTMENTS_UNAVAILABLE','Department services are unavailable.');return deps.departments;};
  const locations=()=>{if(!deps.locations)throw new HttpError(503,'LOCATIONS_UNAVAILABLE','Location services are unavailable.');return deps.locations;};
  const pageInput=(request:express.Request)=>{const page=Number(request.query.page??1),limit=Number(request.query.limit??20);if(!Number.isInteger(page)||page<1||page>10000||!Number.isInteger(limit)||limit<1||limit>100)throw new HttpError(400,'VALIDATION_ERROR','Page or limit is outside the allowed range.');return{page,limit};};
  app.get('/api/v1/departments',requireAuth,async(request,response)=>{const auth=identity(response);try{response.json(await departments().list(auth.userId,auth.sessionId,pageInput(request)));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw e;}});
  app.post('/api/v1/departments',requireAuth,validateBody(DepartmentCreateDto),async(_request,response)=>{const auth=identity(response);try{response.status(201).json(await departments().create(auth.userId,auth.sessionId,response.locals.body as DepartmentCreateDto,response.locals.requestId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission and valid tenant links are required.');throw e;}});
  app.get('/api/v1/departments/options',requireAuth,async(_request,response)=>{const auth=identity(response);try{response.json(await departments().options(auth.userId,auth.sessionId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw e;}});
  app.get('/api/v1/departments/:id',requireAuth,async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Department ID is invalid.');const auth=identity(response);const record=await departments().detail(auth.userId,auth.sessionId,id);if(!record)throw new HttpError(404,'DEPARTMENT_NOT_FOUND','Department not found.');response.json(record);});
  app.patch('/api/v1/departments/:id',requireAuth,validateBody(DepartmentPatchDto),async(request,response)=>{const id=String(request.params.id),auth=identity(response);try{response.json(await departments().update(auth.userId,auth.sessionId,id,response.locals.body as DepartmentPatchDto,response.locals.requestId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission and valid tenant links are required.');if(e instanceof ConcurrencyConflict)throw new HttpError(409,'CONCURRENCY_CONFLICT',e.message);throw e;}});
  app.get('/api/v1/locations',requireAuth,async(request,response)=>{const auth=identity(response);try{response.json(await locations().list(auth.userId,auth.sessionId,pageInput(request)));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw e;}});
  app.post('/api/v1/locations',requireAuth,validateBody(LocationCreateDto),async(_request,response)=>{const auth=identity(response);try{response.status(201).json(await locations().create(auth.userId,auth.sessionId,response.locals.body as LocationCreateDto,response.locals.requestId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission is required.');throw e;}});
  app.get('/api/v1/locations/:id',requireAuth,async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Location ID is invalid.');const auth=identity(response);const record=await locations().detail(auth.userId,auth.sessionId,id);if(!record)throw new HttpError(404,'LOCATION_NOT_FOUND','Location not found.');response.json(record);});
  app.patch('/api/v1/locations/:id',requireAuth,validateBody(LocationPatchDto),async(request,response)=>{const id=String(request.params.id),auth=identity(response);try{response.json(await locations().update(auth.userId,auth.sessionId,id,response.locals.body as LocationPatchDto,response.locals.requestId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Organization management permission is required.');if(e instanceof ConcurrencyConflict)throw new HttpError(409,'CONCURRENCY_CONFLICT',e.message);throw e;}});
  const frameworks=()=>{if(!deps.frameworks)throw new HttpError(503,'FRAMEWORKS_UNAVAILABLE','Framework services are unavailable.');return deps.frameworks;};
  app.get('/api/v1/frameworks',requireAuth,async(request,response)=>{const auth=identity(response);try{response.json(await frameworks().list(auth.userId,auth.sessionId,pageInput(request)));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','An active organization membership is required.');throw e;}});
  app.post('/api/v1/frameworks',requireAuth,validateBody(FrameworkCreateDto),async(_request,response)=>{const auth=identity(response);try{response.status(201).json(await frameworks().create(auth.userId,auth.sessionId,response.locals.body as FrameworkCreateDto,response.locals.requestId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Only custom frameworks can be created for the active organization.');throw e;}});
  app.get('/api/v1/frameworks/:id',requireAuth,async(request,response)=>{const id=String(request.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'VALIDATION_ERROR','Framework ID is invalid.');const auth=identity(response);const record=await frameworks().detail(auth.userId,auth.sessionId,id);if(!record)throw new HttpError(404,'FRAMEWORK_NOT_FOUND','Framework not found.');response.json(record);});
  app.patch('/api/v1/frameworks/:id',requireAuth,validateBody(FrameworkPatchDto),async(request,response)=>{const id=String(request.params.id),auth=identity(response);try{response.json(await frameworks().update(auth.userId,auth.sessionId,id,response.locals.body as FrameworkPatchDto,response.locals.requestId));}catch(e){if(e instanceof TenantAccessDenied)throw new HttpError(403,'FORBIDDEN','Only custom frameworks in the active organization can be edited.');if(e instanceof ConcurrencyConflict)throw new HttpError(409,'CONCURRENCY_CONFLICT',e.message);throw e;}});
  // Development plumbing only, never an unauthenticated production job interface.
  if (deps.nodeEnv !== 'production') {
    app.get('/api/v1/setup/jobs', async (request, response) => {
      const query = parseJobQuery(request.query);
      try { response.json(await deps.listJobs(query)); }
      catch { throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'Cannot load jobs. Check PostgreSQL and apply the migration.'); }
    });
    app.post('/api/v1/setup/jobs', validateBody(HealthJobDto), async (request, response) => {
      const key = request.get('Idempotency-Key');
      if (!key || !/^[a-zA-Z0-9_-]{8,100}$/.test(key)) throw new HttpError(400, 'VALIDATION_ERROR', 'Send an Idempotency-Key header containing 8–100 letters, digits, hyphens or underscores.');
      try {
        const { id, label, status, attempts, lastError } = await deps.submitJob(response.locals.body as HealthJobDto, key);
        response.status(202).json({ id, label, status, attempts, lastError } satisfies JobSummary);
      } catch (error) {
        if (error instanceof IdempotencyConflict) throw new HttpError(409, 'IDEMPOTENCY_CONFLICT', error.message);
        throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'Cannot save this job. Check PostgreSQL and apply the migration.');
      }
    });
  }
  app.use((_request, _response, next) => next(new HttpError(404, 'NOT_FOUND', 'Endpoint not found.')));
  app.use(errorHandler(logger));
  return app;
}
