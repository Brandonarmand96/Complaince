import { supabase } from '@/lib/supabase';

export const ORG_ID = 'a0000000-0000-0000-0000-000000000001';

export async function fetchDashboardData() {
  const [controls, programs, evidence, findings, risks, tasks, frameworks, policies, vendors, assets] = await Promise.all([
    supabase.from('controls').select('*').eq('organization_id', ORG_ID),
    supabase.from('programs').select('*, frameworks(*)').eq('organization_id', ORG_ID),
    supabase.from('evidence').select('*').eq('organization_id', ORG_ID),
    supabase.from('findings').select('*').eq('organization_id', ORG_ID),
    supabase.from('risks').select('*').eq('organization_id', ORG_ID),
    supabase.from('tasks').select('*').eq('organization_id', ORG_ID),
    supabase.from('frameworks').select('*'),
    supabase.from('policies').select('*').eq('organization_id', ORG_ID),
    supabase.from('vendors').select('*').eq('organization_id', ORG_ID),
    supabase.from('assets').select('*').eq('organization_id', ORG_ID),
  ]);

  return {
    controls: controls.data || [],
    programs: programs.data || [],
    evidence: evidence.data || [],
    findings: findings.data || [],
    risks: risks.data || [],
    tasks: tasks.data || [],
    frameworks: frameworks.data || [],
    policies: policies.data || [],
    vendors: vendors.data || [],
    assets: assets.data || [],
  };
}

export async function fetchControlsWithMappings() {
  const { data: controls } = await supabase
    .from('controls')
    .select('*')
    .eq('organization_id', ORG_ID)
    .order('control_id');

  if (!controls) return [];

  const { data: mappings } = await supabase
    .from('control_mappings')
    .select('*, framework_requirements(*, frameworks(name, color))');

  const mappingByControl = (mappings || []).reduce<Record<string, any[]>>((acc, m) => {
    const cid = m.control_id;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(m);
    return acc;
  }, {});

  return controls.map((c) => ({
    ...c,
    mappings: mappingByControl[c.id] || [],
  }));
}

export async function fetchProgramDetail(programId: string) {
  const { data: program } = await supabase
    .from('programs')
    .select('*, frameworks(*)')
    .eq('id', programId)
    .maybeSingle();

  if (!program) return null;

  const { data: programControls } = await supabase
    .from('program_controls')
    .select('*, controls(*)')
    .eq('program_id', programId);

  return { ...program, program_controls: programControls || [] };
}

export function calculateComplianceScore(controls: any[]): number {
  if (!controls.length) return 0;
  const scoreMap: Record<string, number> = {
    'Effective': 1, 'Implemented': 0.85, 'Partially implemented': 0.5,
    'In progress': 0.3, 'Not started': 0, 'Not implemented': 0,
  'Not applicable': 0,
  };
  const total = controls.filter(c => c.status !== 'Not applicable').length;
  if (total === 0) return 0;
  const sum = controls.reduce((acc, c) => acc + (scoreMap[c.status] ?? 0), 0);
  return (sum / total) * 100;
}

export function calculateEvidenceHealth(evidence: any[]): number {
  if (!evidence.length) return 0;
  const now = new Date();
  let score = 0;
  evidence.forEach((e) => {
    if (e.approval_status !== 'Approved') { score += 0.25; return; }
    if (!e.valid_until) { score += 0.75; return; }
    const validUntil = new Date(e.valid_until);
    const daysLeft = (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysLeft < 0) score += 0.25;
    else if (daysLeft < 30) score += 0.75;
    else score += 1;
  });
  return (score / evidence.length) * 100;
}

export function getReadinessScore(controls: any[], evidence: any[], tasks: any[]): number {
  const controlImpl = calculateComplianceScore(controls);
  const evidenceHealth = calculateEvidenceHealth(evidence);
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const remediation = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 100;
  const auditPrep = 65; // placeholder for demo
  return controlImpl * 0.4 + evidenceHealth * 0.25 + remediation * 0.2 + auditPrep * 0.15;
}
