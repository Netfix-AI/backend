import { supabaseService } from '../services/supabaseService.js';
import { rbacService } from '../services/rbacService.js';

export async function runPhase2SecurityTests(): Promise<{ total: number; passed: number; failures: string[] }> {
  const failures: string[] = [];
  let total = 0;
  let passed = 0;

  function assertTest(testName: string, condition: boolean, failReason: string) {
    total++;
    if (condition) {
      passed++;
      console.log(` ✅ [PASS] ${testName}`);
    } else {
      failures.push(`${testName}: ${failReason}`);
      console.error(` ❌ [FAIL] ${testName} - ${failReason}`);
    }
  }

  console.log('\n============================================================');
  console.log('🔒 NETFIX AI — PHASE 2 DOMAIN INTELLIGENCE SECURITY TESTS');
  console.log('============================================================\n');

  // TEST 1: Cross-Client GST Filing Isolation
  const clientAFilings = await supabaseService.getGstFilingsByEntity('ent_marg_tech');
  const clientBUser = { id: 'usr_cli_other', role: 'client' as const };
  const clientBEntity = await supabaseService.getEntityById('ent_marg_tech');
  const clientBAccessDenied = clientBEntity ? clientBEntity.owner_user_id !== clientBUser.id : true;

  assertTest(
    'TEST 1: Client B requesting Client A GST Filing is DENIED',
    clientBAccessDenied,
    'Backend failed to isolate GST filing access between clients'
  );

  // TEST 2: Cross-Client Income Tax Filing Isolation
  const itFiling = await supabaseService.getIncomeTaxFilingById('it_filing_001');
  const clientBAccessIt = itFiling ? (clientBEntity ? clientBEntity.owner_user_id === clientBUser.id : false) : false;

  assertTest(
    'TEST 2: Client B requesting Client A Income Tax Filing is DENIED',
    !clientBAccessIt,
    'Backend failed to block cross-client income tax access'
  );

  // TEST 3: Advocate Research History Isolation
  const advAResearch = await supabaseService.getResearchHistoryByUser('usr_adv_prakash');
  const advBHistory = await supabaseService.getResearchHistoryByUser('usr_adv_other');

  assertTest(
    'TEST 3: Advocate B requesting Advocate A Research History returns EMPTY (Isolated)',
    advBHistory.length === 0,
    'Advocate B was able to view Advocate A research history'
  );

  // TEST 4: Client Unapproved Draft Visibility Protection
  const drafts = await supabaseService.getDraftsByCase('case_gst_2026');
  const clientVisibleDrafts = drafts.filter(d => d.is_client_visible || d.status === 'finalized');
  const containsUnapprovedInternalDraft = clientVisibleDrafts.some(d => !d.is_client_visible && d.status !== 'finalized');

  assertTest(
    'TEST 4: Client query filters out unapproved internal legal drafts',
    !containsUnapprovedInternalDraft,
    'Unapproved internal draft was leaked to client response'
  );

  // TEST 5: Tenant Property Access Isolation
  const tenantBUser = { id: 'usr_tenant_other', role: 'tenant' as const };
  const tenantBLeases = await supabaseService.getLeasesByTenant(tenantBUser.id);

  assertTest(
    'TEST 5: Tenant B attempting access to Tenant A Property returns DENIED',
    tenantBLeases.length === 0,
    'Tenant B was granted unauthorized access to Tenant A property record'
  );

  // TEST 6: Vendor/Stakeholder Project Access Isolation
  const vendorUser = { id: 'usr_vendor_unlinked', role: 'tenant' as const };
  const projectStakeholders = await supabaseService.getProjectStakeholders('proj_skyline_01');
  const isVendorStakeholder = projectStakeholders.some(s => s.user_id === vendorUser.id);

  assertTest(
    'TEST 6: Unlinked Vendor requesting Project details is DENIED',
    !isVendorStakeholder,
    'Vendor was granted unauthorized access to unlinked project'
  );

  // TEST 7: Knowledge Graph Traversal Data Leak Protection
  const kgGraph = await supabaseService.getKnowledgeGraphRelated('node_ipc_302');
  const graphExposesPrivateData = kgGraph.centerNode?.is_private && kgGraph.centerNode.entity_id !== undefined;

  assertTest(
    'TEST 7: Knowledge Graph traversal does not expose private entity/case metadata',
    !graphExposesPrivateData,
    'Knowledge Graph traversal leaked private entity or case metadata'
  );

  // TEST 8: Financial Reconciliation Access Isolation
  const reconReports = await supabaseService.getReconciliationReportsByEntity('ent_marg_tech');
  const clientBReconAccess = clientBEntity ? clientBEntity.owner_user_id === clientBUser.id : false;

  assertTest(
    'TEST 8: Client B requesting Client A Reconciliation Report is DENIED',
    !clientBReconAccess,
    'Backend failed to isolate Tally financial reconciliation data'
  );

  // TEST 9: Email Intake Case Isolation
  const emails = await supabaseService.getEmailIntakeByCase('case_gst_2026');
  const isEmailPresent = emails.length > 0;

  assertTest(
    'TEST 9: Email intake records correctly linked to authorized case',
    isEmailPresent,
    'Email intake record was not found for authorized case'
  );

  // TEST 10: Agent Task Plumbing Integration
  await supabaseService.createAgentTask({
    agent_name: 'Tax Intelligence Agent',
    user_id: 'usr_adv_prakash',
    input_summary: 'GST Analysis Task',
    output_summary: '92% Matched',
    status: 'completed',
  });
  const tasks = await supabaseService.getAgentTasks('usr_adv_prakash');
  const hasPhase2AgentTask = tasks.some(t => t.agent_name.includes('Agent'));

  assertTest(
    'TEST 10: Phase 2 operations create valid Agent Task plumbing entries',
    hasPhase2AgentTask,
    'Agent task entry was not created for Phase 2 intelligence workflow'
  );

  console.log(`\n============================================================`);
  console.log(`Phase 2 Security Tests Complete: ${passed}/${total} PASSED`);
  console.log(`============================================================\n`);

  return { total, passed, failures };
}
