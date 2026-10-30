import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import { Writable } from 'node:stream';
import { pino } from 'pino';
import { createApp } from '../dist/app.js';
import { validateEnvironment } from '../dist/config/environment.js';
import { assertTestResources } from '@complyos/runtime/testing';
import { hashPassword, InvalidCredentials, issueAccessToken, verifyAccessToken, verifyPassword } from '@complyos/runtime/auth';
import { createCaptureMailer } from '@complyos/runtime/mail';
import { businessUnitStore } from '@complyos/runtime/business-units';
import { departmentStore } from '@complyos/runtime/departments';
import { locationStore } from '@complyos/runtime/locations';
import { frameworkStore } from '@complyos/runtime/frameworks';
import { TenantAccessDenied } from '@complyos/runtime/authorization';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ComplianceProgramCreateDto, ComplianceProgramPatchDto } from '../dist/dto.js';
import { RiskCreateDto, AssetCreateDto, VendorCreateDto, VendorPatchDto, FindingCreateDto, FindingPatchDto, TaskCreateDto, PolicyCreateDto, PolicyPatchDto, AuditCreateDto, AuditPatchDto } from '../dist/dto.js';
import { programStore } from '@complyos/runtime/programs';
import { riskStore } from '@complyos/runtime/risks';
import { assetStore } from '@complyos/runtime/assets';
import { vendorStore } from '@complyos/runtime/vendors';
import { findingStore } from '@complyos/runtime/findings';
import { taskStore } from '@complyos/runtime/tasks';
import { policyStore } from '@complyos/runtime/policies';
import { auditStore } from '@complyos/runtime/audits';
import { administrationStore } from '@complyos/runtime/administration';
import { storagePath, sha256Stream, FileSecurityError } from '@complyos/runtime/files';
const authConfig = { accessSecret: 'test-secret-that-is-at-least-32-characters-long', issuer: 'test-issuer', audience: 'test-audience', accessTtlSeconds: 900, refreshTtlSeconds: 3600 };
function fixture(overrides = {}) {
  const entries = [];
  const logger = pino(new Writable({ write(chunk, _encoding, callback) { entries.push(JSON.parse(chunk.toString())); callback(); } }));
  const authResult = { accessToken: 'access', refreshToken: 'refresh-token-value-long-enough', expiresIn: 900, user: { id: 'user-id', email: 'owner@example.com', displayName: 'Owner' } };
  const deps = { checkDatabase: jest.fn().mockResolvedValue(undefined), checkRedis: jest.fn().mockResolvedValue(undefined), submitJob: jest.fn().mockResolvedValue({ id: 'id', label: 'Check', status: 'QUEUED', attempts: 0, lastError: null }), listJobs: jest.fn().mockResolvedValue({ data: [], page: 1, limit: 20, total: 0 }), webOrigin: 'http://127.0.0.1:5173', nodeEnv: 'test', logger, authConfig, auth: { register: jest.fn().mockResolvedValue(authResult), login: jest.fn().mockResolvedValue(authResult), refresh: jest.fn().mockResolvedValue(authResult), logout: jest.fn().mockResolvedValue(undefined), me: jest.fn().mockResolvedValue({ ...authResult.user, memberships: [] }), sessions: jest.fn().mockResolvedValue([]), revokeSession: jest.fn().mockResolvedValue(true), validateAccess: jest.fn().mockResolvedValue(undefined), requestEmailVerification: jest.fn().mockResolvedValue(undefined), consumeEmailVerification: jest.fn().mockResolvedValue({ verified: true }), requestPasswordReset: jest.fn().mockResolvedValue(undefined), completePasswordReset: jest.fn().mockResolvedValue({ reset: true }), assignableRoles: jest.fn().mockResolvedValue([{ id: '33333333-3333-4333-8333-333333333333', name: 'Employee' }]), createInvitation: jest.fn().mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444', status: 'PENDING' }), resendInvitation: jest.fn().mockResolvedValue({ resent: true }), acceptInvitation: jest.fn().mockResolvedValue({ accepted: true }), invitationDetails: jest.fn().mockResolvedValue({ email: 'invitee@example.com', organizationName: 'Acme', accountExists: false }), acceptNewInvitation: jest.fn().mockResolvedValue(authResult), completeMfaChallenge: jest.fn().mockResolvedValue(authResult), switchOrganization: jest.fn().mockResolvedValue({ accessToken: 'new-access', expiresIn: 900, activeOrganizationId: '11111111-1111-4111-8111-111111111111' }) }, security: { transitionUserStatus: jest.fn().mockResolvedValue({ status: 'SUSPENDED' }), beginMfaEnrollment: jest.fn().mockResolvedValue({ secret: 'BASE32SECRET', otpauthUri: 'otpauth://test' }), confirmMfaEnrollment: jest.fn().mockResolvedValue({ enabled: true, recoveryCodes: ['ABCDE-12345'] }), requestMfaReset: jest.fn().mockResolvedValue({ id: 'request-id', status: 'PENDING' }), approveMfaReset: jest.fn().mockResolvedValue({ approved: true }) }, ...overrides };
  return { app: createApp(deps), deps, entries };
}
describe('foundation API', () => {
  it('strictly validates compliance-program create and patch DTOs', async () => {
    const valid={name:'ISO 27001 Program',frameworkVersionId:'11111111-1111-4111-8111-111111111111',ownerMembershipId:'22222222-2222-4222-8222-222222222222',scope:{businessUnitIds:['33333333-3333-4333-8333-333333333333'],dataTypes:['Customer PII']},startDate:'2026-01-01',endDate:'2026-12-31',assessmentType:'CERTIFICATION',stage:'PLANNING',status:'DRAFT'};
    await expect(validate(plainToInstance(ComplianceProgramCreateDto,valid),{whitelist:true,forbidNonWhitelisted:true,forbidUnknownValues:true})).resolves.toHaveLength(0);
    const invalid=plainToInstance(ComplianceProgramCreateDto,{name:'X',assessmentType:'SURPRISE',stage:'DONE',status:'OPEN',organizationId:'44444444-4444-4444-8444-444444444444',scope:{secret:true}});
    const errors=await validate(invalid,{whitelist:true,forbidNonWhitelisted:true,forbidUnknownValues:true});
    expect(errors.map(error=>error.property)).toEqual(expect.arrayContaining(['name','frameworkVersionId','ownerMembershipId','assessmentType','stage','status','organizationId','scope']));
    const patchErrors=await validate(plainToInstance(ComplianceProgramPatchDto,{version:0,status:'ACTIVE',approvalState:'APPROVED'}),{whitelist:true,forbidNonWhitelisted:true,forbidUnknownValues:true});
    expect(patchErrors.map(error=>error.property)).toEqual(expect.arrayContaining(['version','approvalState']));
  });
  it('strictly validates risk DTO fields, categories and unknown input',async()=>{const valid={reference:'R-001',title:'Credential compromise',category:'CYBERSECURITY',threat:'Credential theft',vulnerability:'Weak authentication',ownerMembershipId:'22222222-2222-4222-8222-222222222222',reviewDate:'2026-12-01'};await expect(validate(plainToInstance(RiskCreateDto,valid),{whitelist:true,forbidNonWhitelisted:true,forbidUnknownValues:true})).resolves.toHaveLength(0);const errors=await validate(plainToInstance(RiskCreateDto,{reference:'',title:'X',category:'UNKNOWN',threat:'',vulnerability:'',ownerMembershipId:'bad',organizationId:'hidden'}),{whitelist:true,forbidNonWhitelisted:true,forbidUnknownValues:true});expect(errors.map(error=>error.property)).toEqual(expect.arrayContaining(['reference','title','category','threat','vulnerability','ownerMembershipId','organizationId']))});
  it('strictly validates asset and vendor DTO fields and disallows tenant-controlled fields',async()=>{const asset={name:'Primary database',type:'SOFTWARE',ownerMembershipId:'22222222-2222-4222-8222-222222222222',ipAddress:'10.0.0.5',environment:'PRODUCTION',classification:'RESTRICTED',criticality:'CRITICAL'};await expect(validate(plainToInstance(AssetCreateDto,asset),{whitelist:true,forbidNonWhitelisted:true})).resolves.toHaveLength(0);const assetErrors=await validate(plainToInstance(AssetCreateDto,{...asset,type:'DEVICE',ipAddress:'999.2.3.4',organizationId:'hidden'}),{whitelist:true,forbidNonWhitelisted:true});expect(assetErrors.map(x=>x.property)).toEqual(expect.arrayContaining(['type','ipAddress','organizationId']));const vendor={name:'Cloud host',service:'Infrastructure hosting',businessOwnerMembershipId:'22222222-2222-4222-8222-222222222222',contacts:[{name:'Account team',email:'team@example.com'}],countries:['NG'],dataAccess:['Customer records'],systemAccess:['Production console']};await expect(validate(plainToInstance(VendorCreateDto,vendor),{whitelist:true,forbidNonWhitelisted:true})).resolves.toHaveLength(0);const vendorErrors=await validate(plainToInstance(VendorCreateDto,{...vendor,name:'X',businessOwnerMembershipId:'bad',status:'APPROVED'}),{whitelist:true,forbidNonWhitelisted:true});expect(vendorErrors.map(x=>x.property)).toEqual(expect.arrayContaining(['name','businessOwnerMembershipId','status']))});
  it('returns liveness with the same generated ID in response and log', async () => {
    const { app, entries } = fixture();
    const response = await request(app).get('/health/live').set('X-Request-Id', 'untrusted');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.headers['x-request-id']).not.toBe('untrusted');
    expect(entries.some(log => log.requestId === response.headers['x-request-id'] && log.status === 200)).toBe(true);
  });
  it('reports dependency outages as 503 without leaking credentials', async () => {
    const { app } = fixture({ checkDatabase: jest.fn().mockRejectedValue(new Error('postgres://secret')) });
    const response = await request(app).get('/health/ready');
    expect(response.status).toBe(503);
    expect(response.body.checks).toEqual({ database: 'unavailable', redis: 'ok' });
    expect(response.text).not.toContain('secret');
  });
  it('reports ready when both checks succeed', async () => {
    const { app } = fixture();
    expect((await request(app).get('/health/ready')).status).toBe(200);
  });
  it('rejects unknown fields and wrong types before submitting jobs', async () => {
    const { app, deps } = fixture();
    const response = await request(app).post('/api/v1/setup/jobs').set('Idempotency-Key', 'validation-case').send({ label: '', failUntil: '2', admin: true });
    expect(response.status).toBe(400);
    expect(Object.keys(response.body.error.fields)).toEqual(expect.arrayContaining(['label', 'failUntil', 'admin']));
    expect(deps.submitJob).not.toHaveBeenCalled();
  });
  it.each(['page=-1', 'limit=101', 'sort=password', 'direction=sideways', 'status=unknown', 'limit=2&limit=3', 'filter[secret]=1'])('rejects unsafe query %s', async query => {
    const { app, deps } = fixture();
    const response = await request(app).get('/api/v1/setup/jobs?' + query);
    expect(response.status).toBe(400);
    expect(deps.listJobs).not.toHaveBeenCalled();
  });
  it('passes only documented pagination and filter values', async () => {
    const { app, deps } = fixture();
    const response = await request(app).get('/api/v1/setup/jobs?page=2&limit=5&sort=label&direction=asc&status=FAILED');
    expect(response.status).toBe(200);
    expect(deps.listJobs).toHaveBeenCalledWith({ page: 2, limit: 5, sort: 'label', direction: 'asc', status: 'FAILED' });
  });
  it('returns a safe envelope for malformed JSON and missing routes', async () => {
    const { app } = fixture();
    const response = await request(app).post('/api/v1/setup/jobs').set('Content-Type', 'application/json').send('{secret');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
    expect(response.text).not.toContain('secret');
    const missing = await request(app).get('/missing');
    expect(missing.status).toBe(404);
    expect(missing.body.requestId).toBe(missing.headers['x-request-id']);
  });
  it('hides unexpected failures and does not log provider error messages', async () => {
    const { app, entries } = fixture({ listJobs: jest.fn().mockRejectedValue(new Error('secret provider url')) });
    const response = await request(app).get('/api/v1/setup/jobs');
    expect(response.status).toBe(503);
    expect(response.text + JSON.stringify(entries)).not.toContain('secret provider url');
    expect(response.body).not.toHaveProperty('stack');
  });
  it('serves health documentation', async () => {
    const { app } = fixture();
    expect((await request(app).get('/api/openapi.json')).body.paths).toHaveProperty('/health/ready');
    expect((await request(app).get('/api/docs/')).status).toBe(200);
  });
  it('rejects foreign origins and disables setup jobs in production', async () => {
    const { app } = fixture();
    expect((await request(app).post('/api/v1/setup/jobs').set('Origin', 'https://attacker.example').send({ label: 'Check' })).status).toBe(403);
    const production = fixture({ nodeEnv: 'production' });
    expect((await request(production.app).get('/api/v1/setup/jobs')).status).toBe(404);
  });
  it('authorizes and validates governance, workflow and comment routes', async () => {
    const governance = {
      disableOrganization: jest.fn().mockResolvedValue({ disabledAt: 'now' }), updateSubscription: jest.fn().mockResolvedValue({ plan: 'TEAM' }),
      listAudit: jest.fn().mockResolvedValue([]), listWorkflows: jest.fn().mockResolvedValue([]), saveWorkflow: jest.fn().mockResolvedValue({ id: 'workflow', version: 1 }),
      approvals: jest.fn().mockResolvedValue([]), transition: jest.fn().mockResolvedValue({ state: 'APPROVED' }), createComment: jest.fn().mockResolvedValue({ id: 'comment' }),
      editComment: jest.fn().mockResolvedValue(undefined), listComments: jest.fn().mockResolvedValue([]), toggleReaction: jest.fn().mockResolvedValue({ active: true }),
    };
    const { app } = fixture({ governance }); const token = await issueAccessToken(authConfig, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'); const auth = { Authorization: `Bearer ${token}` };
    expect((await request(app).get('/api/v1/approvals').set(auth)).status).toBe(200);
    expect((await request(app).post('/api/v1/workflows').set(auth).send({ name:'Review',trigger:'SUBMITTED',conditions:[],actors:[],outcomes:{approve:'APPROVED'} })).status).toBe(201);
    expect((await request(app).post('/api/v1/comments').set(auth).send({ resourceType:'Finding',resourceId:'33333333-3333-4333-8333-333333333333',visibility:'INTERNAL',body:'Review this.' })).status).toBe(201);
    expect((await request(app).post('/api/v1/comments').set(auth).send({ resourceType:'Finding',resourceId:'invalid',visibility:'SECRET',body:'' })).status).toBe(400);
    expect(governance.createComment).toHaveBeenCalledTimes(1);
  });
  it('validates and scopes organization list, creation, detail and update routes', async () => {
    const record={id:'33333333-3333-4333-8333-333333333333',name:'Northstar',timezone:'Africa/Lagos',contacts:[],version:1};
    const organizations={list:jest.fn().mockResolvedValue({data:[record],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(record),detail:jest.fn().mockResolvedValue(record),update:jest.fn().mockResolvedValue({...record,name:'Northstar Group',version:2})};
    const {app}=fixture({organizations});const token=await issueAccessToken(authConfig,'11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');const auth={Authorization:`Bearer ${token}`};
    expect((await request(app).get('/api/v1/organizations?page=1&limit=20').set(auth)).body.total).toBe(1);
    expect((await request(app).post('/api/v1/organizations').set(auth).send({name:'Northstar',timezone:'Africa/Lagos',country:'NG'})).status).toBe(201);
    expect((await request(app).post('/api/v1/organizations').set(auth).send({name:'N',timezone:'bad',country:'Nigeria',disabledAt:'now'})).status).toBe(400);
    expect((await request(app).get(`/api/v1/organizations/${record.id}`).set(auth)).status).toBe(200);
    expect((await request(app).patch(`/api/v1/organizations/${record.id}`).set(auth).send({name:'Northstar Group',version:1})).body.version).toBe(2);
    expect(organizations.create).toHaveBeenCalledTimes(1);
  });
  it('validates business-unit CRUD routes and rejects disallowed fields', async () => {
    const record={id:'33333333-3333-4333-8333-333333333333',organizationId:'11111111-1111-4111-8111-111111111111',name:'Security',type:'FUNCTION',parentUnitId:null,parentName:null,version:1};
    const businessUnits={list:jest.fn().mockResolvedValue({data:[record],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(record),detail:jest.fn().mockResolvedValue(record),update:jest.fn().mockResolvedValue({...record,name:'Security Operations',version:2})};
    const {app}=fixture({businessUnits});const token=await issueAccessToken(authConfig,'user-id','22222222-2222-4222-8222-222222222222');const auth={Authorization:`Bearer ${token}`};
    expect((await request(app).get('/api/v1/business-units?page=1&limit=20').set(auth)).body.total).toBe(1);
    expect((await request(app).get('/api/v1/business-units?limit=101').set(auth)).status).toBe(400);
    expect((await request(app).post('/api/v1/business-units').set(auth).send({name:'Security',type:'FUNCTION'})).status).toBe(201);
    expect((await request(app).post('/api/v1/business-units').set(auth).send({name:'S',type:'TEAM',organizationId:record.organizationId})).status).toBe(400);
    expect((await request(app).get(`/api/v1/business-units/${record.id}`).set(auth)).status).toBe(200);
    expect((await request(app).patch(`/api/v1/business-units/${record.id}`).set(auth).send({name:'Security Operations',version:1})).body.version).toBe(2);
    expect(businessUnits.create).toHaveBeenCalledTimes(1);
  });
  it('rejects business-unit access without a verified active tenant context', async()=>{
    const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};
    await expect(businessUnitStore(db).list('user-id','session-id',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);
  });
  it('validates department and location CRUD routes',async()=>{const department={id:'33333333-3333-4333-8333-333333333333',name:'Security',version:1};const location={id:'44444444-4444-4444-8444-444444444444',name:'Lagos HQ',address:{line1:'1 Marina Road',city:'Lagos'},country:'NG',timezone:'Africa/Lagos',version:1};const departments={list:jest.fn().mockResolvedValue({data:[department],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(department),detail:jest.fn().mockResolvedValue(department),update:jest.fn().mockResolvedValue({...department,version:2})};const locations={list:jest.fn().mockResolvedValue({data:[location],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(location),detail:jest.fn().mockResolvedValue(location),update:jest.fn().mockResolvedValue({...location,version:2})};const{app}=fixture({departments,locations});const token=await issueAccessToken(authConfig,'user-id','22222222-2222-4222-8222-222222222222'),auth={Authorization:`Bearer ${token}`};expect((await request(app).get('/api/v1/departments').set(auth)).status).toBe(200);expect((await request(app).post('/api/v1/departments').set(auth).send({name:'Security'})).status).toBe(201);expect((await request(app).post('/api/v1/departments').set(auth).send({name:'S',status:'ACTIVE'})).status).toBe(400);expect((await request(app).patch(`/api/v1/departments/${department.id}`).set(auth).send({name:'Security Operations',version:1})).status).toBe(200);expect((await request(app).get('/api/v1/locations').set(auth)).status).toBe(200);expect((await request(app).post('/api/v1/locations').set(auth).send({name:'Lagos HQ',address:{line1:'1 Marina Road',city:'Lagos'},country:'NG',timezone:'Africa/Lagos'})).status).toBe(201);expect((await request(app).post('/api/v1/locations').set(auth).send({name:'L',address:{city:'Lagos'},country:'Nigeria',timezone:'bad',ownerId:'x'})).status).toBe(400);expect((await request(app).get(`/api/v1/locations/${location.id}`).set(auth)).status).toBe(200);});
  it('denies department and location lists without active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(departmentStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);await expect(locationStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);});
  it('validates and routes framework catalog CRUD',async()=>{const record={id:'88888888-8888-4888-8888-888888888888',organizationId:'org',name:'Security Baseline',publisher:'Acme',description:'Controls',ownership:'CUSTOM',version:1};const frameworks={list:jest.fn().mockResolvedValue({data:[record],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(record),detail:jest.fn().mockResolvedValue(record),update:jest.fn().mockResolvedValue({...record,version:2})};const{app}=fixture({frameworks});const token=await issueAccessToken(authConfig,'user-id','22222222-2222-4222-8222-222222222222'),auth={Authorization:`Bearer ${token}`};expect((await request(app).get('/api/v1/frameworks?page=1&limit=20').set(auth)).body.total).toBe(1);expect((await request(app).post('/api/v1/frameworks').set(auth).send({name:'Security Baseline',publisher:'Acme',ownership:'CUSTOM'})).status).toBe(201);expect((await request(app).post('/api/v1/frameworks').set(auth).send({name:'S',publisher:'A',ownership:'TENANT',status:'ACTIVE'})).status).toBe(400);expect((await request(app).get(`/api/v1/frameworks/${record.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/frameworks/${record.id}`).set(auth).send({name:'Security Baseline 2',version:1})).body.version).toBe(2);});
  it('denies framework access without active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(frameworkStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);});
  it('routes compliance-program CRUD and risk listing with bounded pagination',async()=>{
    const program={id:'55555555-5555-4555-8555-555555555555',name:'ISO Program',frameworkVersionId:'11111111-1111-4111-8111-111111111111',ownerMembershipId:'22222222-2222-4222-8222-222222222222',assessmentType:'INTERNAL',stage:'PLANNING',status:'DRAFT',scope:{},version:1};
    const programs={list:jest.fn().mockResolvedValue({data:[program],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(program),detail:jest.fn().mockResolvedValue(program),update:jest.fn().mockResolvedValue({...program,name:'Updated',version:2}),options:jest.fn().mockResolvedValue({versions:[],owners:[]})},risks={list:jest.fn().mockResolvedValue({data:[],total:0,page:1,limit:20})};
    const{app}=fixture({programs,risks}),token=await issueAccessToken(authConfig,'user-id','22222222-2222-4222-8222-222222222222'),auth={Authorization:`Bearer ${token}`};
    expect((await request(app).get('/api/v1/programs?page=1&limit=20').set(auth)).body.total).toBe(1);
    expect((await request(app).get('/api/v1/programs?limit=101').set(auth)).status).toBe(400);
    expect((await request(app).get('/api/v1/programs')).status).toBe(401);
    const body={name:'ISO Program',frameworkVersionId:program.frameworkVersionId,ownerMembershipId:program.ownerMembershipId,scope:{},assessmentType:'INTERNAL',stage:'PLANNING',status:'DRAFT'};
    expect((await request(app).post('/api/v1/programs').set(auth).send(body)).status).toBe(201);
    expect((await request(app).get(`/api/v1/programs/${program.id}`).set(auth)).body.name).toBe('ISO Program');
    expect((await request(app).patch(`/api/v1/programs/${program.id}`).set(auth).send({name:'Updated',version:1})).body.version).toBe(2);
    expect((await request(app).patch(`/api/v1/programs/${program.id}`).set(auth).send({stage:'COMPLETE',version:1})).status).toBe(400);
    expect((await request(app).get('/api/v1/risks?page=1&limit=20').set(auth)).status).toBe(200);
    expect((await request(app).get('/api/v1/risks?limit=101').set(auth)).status).toBe(400);
  });
  it('denies program and risk lists without an active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(programStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);await expect(riskStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied)});
  it('routes risk CRUD, asset CRUD, and bounded vendor listing',async()=>{const risk={id:'11111111-1111-4111-8111-111111111111',reference:'R-1',title:'Risk',category:'OTHER',threat:'Threat',vulnerability:'Weakness',ownerMembershipId:'22222222-2222-4222-8222-222222222222',version:1},asset={id:'33333333-3333-4333-8333-333333333333',name:'Database',type:'SOFTWARE',ownerMembershipId:risk.ownerMembershipId,classification:'RESTRICTED',criticality:'CRITICAL',version:1};const risks={list:jest.fn().mockResolvedValue({data:[risk],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(risk),detail:jest.fn().mockResolvedValue(risk),update:jest.fn().mockResolvedValue({...risk,version:2}),options:jest.fn().mockResolvedValue({owners:[]})},assets={list:jest.fn().mockResolvedValue({data:[asset],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(asset),detail:jest.fn().mockResolvedValue(asset),update:jest.fn().mockResolvedValue({...asset,version:2}),options:jest.fn().mockResolvedValue({people:[],departments:[],locations:[]})},vendors={list:jest.fn().mockResolvedValue({data:[],total:0,page:1,limit:20})};const{app}=fixture({risks,assets,vendors}),token=await issueAccessToken(authConfig,'user','22222222-2222-4222-8222-222222222222'),auth={Authorization:`Bearer ${token}`};expect((await request(app).post('/api/v1/risks').set(auth).send({...risk,id:undefined,version:undefined})).status).toBe(201);expect((await request(app).get(`/api/v1/risks/${risk.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/risks/${risk.id}`).set(auth).send({title:'Updated risk',version:1})).status).toBe(200);expect((await request(app).post('/api/v1/assets').set(auth).send({...asset,id:undefined,version:undefined})).status).toBe(201);expect((await request(app).get(`/api/v1/assets/${asset.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/assets/${asset.id}`).set(auth).send({name:'Updated database',version:1})).status).toBe(200);expect((await request(app).get('/api/v1/vendors?page=1&limit=20').set(auth)).status).toBe(200);expect((await request(app).get('/api/v1/vendors?limit=101').set(auth)).status).toBe(400)});
  it('denies asset and vendor lists without an active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(assetStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);await expect(vendorStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied)});
  it('validates and routes vendor create, detail and ordinary update',async()=>{
    const vendor={id:'44444444-4444-4444-8444-444444444444',name:'Cloud host',service:'Infrastructure hosting',businessOwnerMembershipId:'22222222-2222-4222-8222-222222222222',contacts:[{name:'Account team',email:'team@example.com'}],countries:['NG'],dataAccess:['Customer records'],systemAccess:['Production console'],contractStartDate:'2026-01-01',contractEndDate:'2027-01-01',version:1};
    const vendors={list:jest.fn().mockResolvedValue({data:[vendor],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(vendor),detail:jest.fn().mockResolvedValue(vendor),update:jest.fn().mockResolvedValue({...vendor,service:'Managed hosting',version:2}),options:jest.fn().mockResolvedValue({owners:[]})};
    const{app}=fixture({vendors}),token=await issueAccessToken(authConfig,'user','22222222-2222-4222-8222-222222222222'),auth={Authorization:`Bearer ${token}`},body={name:vendor.name,service:vendor.service,businessOwnerMembershipId:vendor.businessOwnerMembershipId,contacts:vendor.contacts,countries:vendor.countries,dataAccess:vendor.dataAccess,systemAccess:vendor.systemAccess,contractStartDate:vendor.contractStartDate,contractEndDate:vendor.contractEndDate};
    expect((await request(app).post('/api/v1/vendors').set(auth).send(body)).status).toBe(201);
    expect((await request(app).post('/api/v1/vendors').set(auth).send({...body,organizationId:'hidden'})).status).toBe(400);
    expect((await request(app).get(`/api/v1/vendors/${vendor.id}`).set(auth)).body.name).toBe(vendor.name);
    expect((await request(app).patch(`/api/v1/vendors/${vendor.id}`).set(auth).send({service:'Managed hosting',version:1})).body.version).toBe(2);
    expect((await request(app).patch(`/api/v1/vendors/${vendor.id}`).set(auth).send({approvalState:'APPROVED',version:1})).status).toBe(400);
    const patchErrors=await validate(plainToInstance(VendorPatchDto,{version:1,approvalState:'APPROVED'}),{whitelist:true,forbidNonWhitelisted:true});expect(patchErrors.map(x=>x.property)).toContain('approvalState');
  });
  it('validates and routes finding CRUD and bounded task listing',async()=>{const owner='22222222-2222-4222-8222-222222222222',finding={id:'55555555-5555-4555-8555-555555555555',type:'AUDIT',title:'Access review gap',description:'Quarterly review evidence is incomplete.',severity:'HIGH',ownerMembershipId:owner,version:1};const findings={list:jest.fn().mockResolvedValue({data:[finding],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(finding),detail:jest.fn().mockResolvedValue(finding),update:jest.fn().mockResolvedValue({...finding,version:2}),options:jest.fn().mockResolvedValue({owners:[]})},tasks={list:jest.fn().mockResolvedValue({data:[],total:0,page:1,limit:20})};const{app}=fixture({findings,tasks}),token=await issueAccessToken(authConfig,'user',owner),auth={Authorization:`Bearer ${token}`};expect((await request(app).get('/api/v1/findings').set(auth)).status).toBe(200);expect((await request(app).post('/api/v1/findings').set(auth).send({...finding,id:undefined,version:undefined})).status).toBe(201);expect((await request(app).get(`/api/v1/findings/${finding.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/findings/${finding.id}`).set(auth).send({title:'Updated gap',version:1})).status).toBe(200);expect((await request(app).patch(`/api/v1/findings/${finding.id}`).set(auth).send({approvalState:'APPROVED',version:1})).status).toBe(400);expect((await request(app).get('/api/v1/tasks?limit=101').set(auth)).status).toBe(400);expect((await request(app).get('/api/v1/tasks')).status).toBe(401);const badTask=await validate(plainToInstance(TaskCreateDto,{title:'x',type:'BAD',priority:'NOW',ownerMembershipId:'x',status:'OPEN',progress:101}),{whitelist:true,forbidNonWhitelisted:true});expect(badTask.length).toBeGreaterThan(0);const badFinding=await validate(plainToInstance(FindingCreateDto,{...finding,id:undefined,version:undefined,severity:'EXTREME',organizationId:'hidden'}),{whitelist:true,forbidNonWhitelisted:true});expect(badFinding.map(x=>x.property)).toEqual(expect.arrayContaining(['severity','organizationId']))});
  it('denies finding and task lists without active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(findingStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied);await expect(taskStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied)});
  it('routes task and policy metadata CRUD with validation',async()=>{const owner='22222222-2222-4222-8222-222222222222',task={id:'66666666-6666-4666-8666-666666666666',title:'Close gap',type:'REMEDIATION',priority:'HIGH',ownerMembershipId:owner,status:'TODO',progress:0,version:1},policy={id:'77777777-7777-4777-8777-777777777777',number:'POL-001',title:'Access control policy',category:'Security',authorMembershipId:owner,ownerMembershipId:owner,classification:'INTERNAL',version:1};const tasks={list:jest.fn().mockResolvedValue({data:[task],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(task),detail:jest.fn().mockResolvedValue(task),update:jest.fn().mockResolvedValue({...task,version:2}),options:jest.fn().mockResolvedValue({owners:[]})},policies={list:jest.fn().mockResolvedValue({data:[policy],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(policy),detail:jest.fn().mockResolvedValue(policy),update:jest.fn().mockResolvedValue({...policy,version:2}),options:jest.fn().mockResolvedValue({people:[]})};const{app}=fixture({tasks,policies}),token=await issueAccessToken(authConfig,'user',owner),auth={Authorization:`Bearer ${token}`};expect((await request(app).post('/api/v1/tasks').set(auth).send({...task,id:undefined,version:undefined})).status).toBe(201);expect((await request(app).get(`/api/v1/tasks/${task.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/tasks/${task.id}`).set(auth).send({progress:50,version:1})).status).toBe(200);expect((await request(app).post('/api/v1/policies').set(auth).send({...policy,id:undefined,version:undefined})).status).toBe(201);expect((await request(app).get(`/api/v1/policies/${policy.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/policies/${policy.id}`).set(auth).send({category:'Governance',version:1})).status).toBe(200);expect((await request(app).patch(`/api/v1/policies/${policy.id}`).set(auth).send({approvalStatus:'APPROVED',version:1})).status).toBe(400);const invalid=await validate(plainToInstance(PolicyCreateDto,{...policy,id:undefined,version:undefined,classification:'SECRET',organizationId:'hidden'}),{whitelist:true,forbidNonWhitelisted:true});expect(invalid.map(x=>x.property)).toEqual(expect.arrayContaining(['classification','organizationId']));const patch=await validate(plainToInstance(PolicyPatchDto,{version:1,approvalStatus:'APPROVED'}),{whitelist:true,forbidNonWhitelisted:true});expect(patch.map(x=>x.property)).toContain('approvalStatus')});
  it('denies policy lists without active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(policyStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied)});
  it('validates and routes audit plan CRUD',async()=>{const owner='22222222-2222-4222-8222-222222222222',audit={id:'88888888-8888-4888-8888-888888888888',title:'Annual internal audit',type:'INTERNAL',scope:{departments:['Security']},objectives:['Assess effectiveness'],criteria:['ISO 27001'],leadAuditorMembershipId:owner,startDate:'2026-11-01',endDate:'2026-11-30',status:'PLANNED',version:1},audits={list:jest.fn().mockResolvedValue({data:[audit],total:1,page:1,limit:20}),create:jest.fn().mockResolvedValue(audit),detail:jest.fn().mockResolvedValue(audit),update:jest.fn().mockResolvedValue({...audit,version:2}),options:jest.fn().mockResolvedValue({auditors:[]})};const{app}=fixture({audits}),token=await issueAccessToken(authConfig,'user',owner),auth={Authorization:`Bearer ${token}`};expect((await request(app).get('/api/v1/audits').set(auth)).status).toBe(200);expect((await request(app).get('/api/v1/audits?limit=101').set(auth)).status).toBe(400);expect((await request(app).get('/api/v1/audits')).status).toBe(401);expect((await request(app).post('/api/v1/audits').set(auth).send({...audit,id:undefined,version:undefined})).status).toBe(201);expect((await request(app).get(`/api/v1/audits/${audit.id}`).set(auth)).status).toBe(200);expect((await request(app).patch(`/api/v1/audits/${audit.id}`).set(auth).send({title:'Updated audit',version:1})).status).toBe(200);expect((await request(app).patch(`/api/v1/audits/${audit.id}`).set(auth).send({approvalState:'APPROVED',version:1})).status).toBe(400);const invalid=await validate(plainToInstance(AuditCreateDto,{...audit,id:undefined,version:undefined,type:'SURPRISE',organizationId:'hidden'}),{whitelist:true,forbidNonWhitelisted:true});expect(invalid.map(x=>x.property)).toEqual(expect.arrayContaining(['type','organizationId']));const patch=await validate(plainToInstance(AuditPatchDto,{version:1,approvalState:'APPROVED'}),{whitelist:true,forbidNonWhitelisted:true});expect(patch.map(x=>x.property)).toContain('approvalState')});
  it('denies audit lists without active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(auditStore(db).list('user','session',{page:1,limit:20})).rejects.toBeInstanceOf(TenantAccessDenied)});
  it('routes role, membership, settings, platform and support administration',async()=>{const id='22222222-2222-4222-8222-222222222222',settings={organizationId:id,dateFormat:'YYYY-MM-DD',currency:'USD',retentionDays:2555,brandColor:'#2563eb',requireMfa:false,emailNotifications:true,version:1},administration={roles:jest.fn().mockResolvedValue({roles:[],assignablePermissions:['organization:manage']}),createRole:jest.fn().mockResolvedValue({id,name:'Reviewer'}),updateRole:jest.fn().mockResolvedValue({updated:true}),users:jest.fn().mockResolvedValue([]),assignRole:jest.fn().mockResolvedValue({assigned:true}),settings:jest.fn().mockResolvedValue(settings),updateSettings:jest.fn().mockResolvedValue({...settings,version:2}),logo:jest.fn().mockResolvedValue({attached:true}),platformOrganizations:jest.fn().mockResolvedValue([]),createSupport:jest.fn().mockResolvedValue({id,status:'PENDING'}),supportRequests:jest.fn().mockResolvedValue([]),resolveSupport:jest.fn().mockResolvedValue({id,status:'APPROVED',expiresAt:'2026-12-01T00:00:00Z'})};const{app}=fixture({administration}),token=await issueAccessToken(authConfig,'user',id),auth={Authorization:`Bearer ${token}`};expect((await request(app).get('/api/v1/admin/roles').set(auth)).status).toBe(200);expect((await request(app).post('/api/v1/admin/roles').set(auth).send({name:'Reviewer',permissions:['organization:manage']})).status).toBe(201);expect((await request(app).put(`/api/v1/admin/memberships/${id}/role`).set(auth).send({roleId:id})).status).toBe(200);expect((await request(app).put('/api/v1/admin/settings').set(auth).send({...settings,organizationId:undefined})).body.version).toBe(2);expect((await request(app).get('/api/v1/platform/organizations').set(auth)).status).toBe(200);expect((await request(app).post('/api/v1/platform/support-access').set(auth).send({organizationId:id,resources:['settings'],reason:'Investigate customer configuration issue',expiresAt:'2026-12-01T00:00:00Z'})).status).toBe(201);expect((await request(app).post(`/api/v1/admin/support-access/${id}/decision`).set(auth).send({status:'APPROVED'})).status).toBe(200);expect((await request(app).post('/api/v1/admin/roles').set(auth).send({name:'x',permissions:[],isSystem:true})).status).toBe(400)});
  it('denies administration without active tenant context',async()=>{const db={query:jest.fn().mockResolvedValue({rows:[],rowCount:0}),connect:jest.fn()};await expect(administrationStore(db).roles('user','session')).rejects.toBeInstanceOf(TenantAccessDenied)});
  it('routes idempotent activation, stage actions, and secure file boundaries',async()=>{const id='22222222-2222-4222-8222-222222222222',program={id,name:'ISO',frameworkVersionId:id,ownerMembershipId:id,scope:{},assessmentType:'INTERNAL',stage:'PLANNING',status:'ACTIVE',version:1},programs={activate:jest.fn().mockResolvedValue(program),transitionStage:jest.fn().mockResolvedValue({...program,stage:'READINESS',version:2})},files={upload:jest.fn().mockResolvedValue({id,scanState:'PENDING'}),grant:jest.fn().mockResolvedValue({token:'grant',expiresAt:'2026-12-01T00:00:00Z'}),download:jest.fn().mockResolvedValue({data:Buffer.from('safe'),mimeType:'text/plain',filename:'safe.txt'}),preview:jest.fn(),retentionEligible:jest.fn().mockResolvedValue([]),purge:jest.fn().mockResolvedValue({purged:0})};const{app}=fixture({programs,files}),token=await issueAccessToken(authConfig,'user',id),auth={Authorization:`Bearer ${token}`},body={name:'ISO',frameworkVersionId:id,ownerMembershipId:id,scope:{},assessmentType:'INTERNAL',stage:'PLANNING',status:'ACTIVE'};expect((await request(app).post('/api/v1/programs/activate').set(auth).set('Idempotency-Key','activation-123').send(body)).status).toBe(201);expect((await request(app).post(`/api/v1/programs/${id}/stage`).set(auth).send({stage:'READINESS',version:1})).body.stage).toBe('READINESS');expect((await request(app).post('/files/upload').set(auth).send({filename:'safe.txt',mimeType:'text/plain',base64:Buffer.from('safe').toString('base64')})).status).toBe(201);expect((await request(app).post('/files/grants').set(auth).send({fileId:id})).status).toBe(201);expect((await request(app).get('/files/download?token=grant').set(auth)).text).toBe('safe')});
  it('contains storage paths and computes streaming hashes',async()=>{expect(()=>storagePath('C:/safe','../escape')).toThrow(FileSecurityError);expect(()=>storagePath('C:/safe','C:/escape')).toThrow(FileSecurityError);async function* chunks(){yield Buffer.from('hello ');yield Buffer.from('world')}expect(await sha256Stream(chunks())).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')});
});
describe('configuration and integration guard', () => {
  const env = { DATABASE_URL: 'postgresql://u:p@db.example/dev', REDIS_URL: 'rediss://u:p@cache.example:6379/0', ACCESS_JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long' };
  it('accepts hosted provider URLs and rejects missing, malformed and secret-bearing invalid input safely', () => {
    expect(validateEnvironment(env).port).toBe(4000);
    expect(() => validateEnvironment({ ...env, REDIS_URL: '' })).toThrow('REDIS_URL is required');
    expect(() => validateEnvironment({ ...env, PORT: '65536' })).toThrow('PORT');
    expect(() => validateEnvironment({ ...env, DATABASE_URL: 'secret-value' })).toThrow('DATABASE_URL');
    try { validateEnvironment({ ...env, DATABASE_URL: 'secret-value' }); } catch (error) { expect(error.message).not.toContain('secret-value'); }
  });
  it('refuses non-test databases and shared development Redis', () => {
    expect(() => assertTestResources('postgresql://u:p@remote/dev', 'redis://remote/15')).toThrow();
    expect(() => assertTestResources('postgresql://u:p@remote/complyos_test', 'redis://remote/0', { redisUrl: 'redis://other:password@remote/0' })).toThrow();
    expect(() => assertTestResources('postgresql://u:p@remote/complyos_test', 'rediss://test-cache/0', { redisUrl: 'rediss://app-cache/0' })).not.toThrow();
  });
});

describe('authentication foundation', () => {
  it('hashes passwords with Argon2id and rejects an invalid password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, 'correct horse battery staple')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'incorrect password')).resolves.toBe(false);
  });
  it('issues and verifies constrained access JWTs', async () => {
    const token = await issueAccessToken(authConfig, 'user-id');
    await expect(verifyAccessToken(authConfig, token)).resolves.toMatchObject({ userId: 'user-id' });
    await expect(verifyAccessToken({ ...authConfig, audience: 'wrong' }, token)).rejects.toBeInstanceOf(InvalidCredentials);
    await expect(verifyAccessToken({ ...authConfig, issuer: 'wrong' }, token)).rejects.toBeInstanceOf(InvalidCredentials);
    await expect(verifyAccessToken({ ...authConfig, accessSecret: 'different-secret-that-is-at-least-32-characters' }, token)).rejects.toBeInstanceOf(InvalidCredentials);
    const expired = await issueAccessToken({ ...authConfig, accessTtlSeconds: -1 }, 'user-id');
    await expect(verifyAccessToken(authConfig, expired)).rejects.toBeInstanceOf(InvalidCredentials);
  });
  it('validates registration, keeps login failures generic and authenticates bearer requests', async () => {
    const { app, deps } = fixture();
    const invalid = await request(app).post('/auth/register').send({ email: 'bad', password: 'short', displayName: '', organizationName: '' });
    expect(invalid.status).toBe(400);
    expect(deps.auth.register).not.toHaveBeenCalled();
    const registered = await request(app).post('/auth/register').send({ email: 'Owner@Example.com', password: 'correct horse battery staple', displayName: 'Owner', organizationName: 'Example' });
    expect(registered.status).toBe(201);
    expect(registered.body).not.toHaveProperty('refreshToken');
    expect(registered.headers['set-cookie'][0]).toMatch(/complyos_refresh=.*HttpOnly.*SameSite=Lax/);
    const failing = fixture({ auth: { ...deps.auth, login: jest.fn().mockRejectedValue(new InvalidCredentials()) } });
    const login = await request(failing.app).post('/auth/login').send({ email: 'unknown@example.com', password: 'any password' });
    expect(login.status).toBe(401);
    expect(login.body.error.message).toBe('Email or password is incorrect.');
    expect((await request(app).get('/auth/verify')).status).toBe(401);
    const token = await issueAccessToken(authConfig, 'user-id');
    const verified = await request(app).get('/auth/verify').set('Authorization', `Bearer ${token}`);
    expect(verified.status).toBe(200);
    expect(verified.body.userId).toBe('user-id');
  });
  it('projects the current user and restricts session revocation to the caller', async () => {
    const { app, deps } = fixture();
    const token = await issueAccessToken(authConfig, 'user-id', '11111111-1111-4111-8111-111111111111');
    const authorization = { Authorization: `Bearer ${token}` };
    const me = await request(app).get('/auth/me').set(authorization);
    expect(me.status).toBe(200);
    expect(deps.auth.me).toHaveBeenCalledWith('user-id', '11111111-1111-4111-8111-111111111111');
    expect((await request(app).get('/auth/sessions').set(authorization)).status).toBe(200);
    deps.auth.revokeSession.mockResolvedValueOnce(false);
    expect((await request(app).delete('/auth/sessions/22222222-2222-4222-8222-222222222222').set(authorization)).status).toBe(404);
  });
  it('rate limits repeated login attempts', async () => {
    const { app } = fixture();
    let response;
    for (let attempt = 0; attempt < 11; attempt += 1) response = await request(app).post('/auth/login').send({ email: 'owner@example.com', password: 'password' });
    expect(response.status).toBe(429);
  });
  it('keeps password-reset requests neutral and completes a valid reset', async () => {
    const { app, deps } = fixture();
    expect((await request(app).post('/auth/password-reset/request').send({ email: 'unknown@example.com' })).status).toBe(202);
    expect(deps.auth.requestPasswordReset).toHaveBeenCalledWith('unknown@example.com');
    expect((await request(app).post('/auth/password-reset/complete').send({ token: 'a-valid-reset-token-that-is-long', password: 'a new secure passphrase' })).body).toEqual({ reset: true });
  });
  it('limits invitation roles to the authenticated inviter', async () => {
    const { app, deps } = fixture();
    const token = await issueAccessToken(authConfig, 'user-id');
    const authorization = { Authorization: `Bearer ${token}` };
    const organizationId = '11111111-1111-4111-8111-111111111111';
    expect((await request(app).get(`/invitations/roles?organizationId=${organizationId}`).set(authorization)).status).toBe(200);
    const payload = { organizationId, email: 'invitee@example.com', roleIds: ['33333333-3333-4333-8333-333333333333'] };
    expect((await request(app).post('/invitations').set(authorization).send(payload)).status).toBe(201);
    expect(deps.auth.createInvitation).toHaveBeenCalledWith('user-id', payload);
  });
  it('keeps MFA enrollment pending, confirms it, and challenges login before issuing access', async () => {
    const { app, deps } = fixture({ auth: { ...fixture().deps.auth, login: jest.fn().mockResolvedValue({ mfaRequired: true, challengeToken: 'challenge-token-long-enough-value', expiresIn: 300 }) } });
    const login = await request(app).post('/auth/login').send({ email: 'owner@example.com', password: 'correct horse battery staple' });
    expect(login.body.mfaRequired).toBe(true); expect(login.headers['set-cookie']).toBeUndefined();
    const challenged = await request(app).post('/auth/mfa/challenge').send({ challengeToken: 'challenge-token-long-enough-value', code: '123456' });
    expect(challenged.status).toBe(200); expect(deps.auth.completeMfaChallenge).toHaveBeenCalled();
  });
  it('switches organization only through the verified session and supports status transitions', async () => {
    const { app, deps } = fixture(); const token = await issueAccessToken(authConfig, 'user-id', '11111111-1111-4111-8111-111111111111'); const authorization = { Authorization: `Bearer ${token}` };
    const organizationId = '22222222-2222-4222-8222-222222222222';
    expect((await request(app).post('/auth/switch-organization').set(authorization).send({ organizationId })).status).toBe(200);
    expect(deps.auth.switchOrganization).toHaveBeenCalledWith('user-id', '11111111-1111-4111-8111-111111111111', organizationId);
    expect((await request(app).post('/users/33333333-3333-4333-8333-333333333333/status').set(authorization).send({ organizationId, status: 'SUSPENDED' })).status).toBe(200);
  });
  it('uses an isolated capture mailer without contacting a recipient', async () => {
    const mailer = createCaptureMailer();
    await mailer.send({ to: 'person@example.com', subject: 'Verify', text: 'local activation link' });
    expect(mailer.messages).toEqual([{ to: 'person@example.com', subject: 'Verify', text: 'local activation link' }]);
  });
  it('rejects an unauthorized unified-control list caller before invoking the store', async () => {
    const controls = { list: jest.fn() };
    const { app } = fixture({ controls });
    const response = await request(app).get('/api/v1/controls');
    expect(response.status).toBe(401);
    expect(controls.list).not.toHaveBeenCalled();
  });
});
