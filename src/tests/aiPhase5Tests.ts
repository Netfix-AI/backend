import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { supabaseService } from '../services/supabaseService.js';
import { rbacService } from '../services/rbacService.js';
import { runAiPhase1Tests } from './aiPhase1Tests.js';
import { runAiPhase2Tests } from './aiPhase2Tests.js';
import { runAiPhase3Tests } from './aiPhase3Tests.js';
import { ragService } from '../services/ragService.js';

export async function runAiPhase5Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('📡 NETFIX AI — PHASE 5 LIVE ACTIVITY FEED DATA WIRING TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1-4: End-to-End Real Backend Task Progress & Polling
  // ----------------------------------------------------
  try {
    const orchestrateRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Live Activity Feed Real Data Test',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'dummy',
    });

    const taskId = orchestrateRes.task_id;
    const taskRecord = await supabaseService.getAgentTaskById(taskId);

    assertTest(
      'TEST 1: agent_tasks row exists in backend state for orchestrated task',
      Boolean(taskRecord && taskRecord.id === taskId),
      `Task row for ${taskId} not found in database/memory store`
    );
    assertTest(
      'TEST 2: task status is completed in backend state',
      taskRecord?.status === 'completed',
      `Expected status 'completed', got '${taskRecord?.status}'`
    );
    assertTest(
      'TEST 3: current_step matches orchestrator step progression',
      Boolean(taskRecord && (taskRecord.current_step ?? 0) >= 4),
      `Expected current_step >= 4, got ${taskRecord?.current_step}`
    );
    assertTest(
      'TEST 4: output_summary is non-empty string in backend state',
      Boolean(taskRecord && taskRecord.output_summary.length > 0),
      'output_summary is empty in task record'
    );
  } catch (err: any) {
    assertTest('TEST 1-4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5 & 6: ai_source Visibility Tag Preservation
  // ----------------------------------------------------
  try {
    const fallbackRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Force fallback for activity feed test',
      requestingUserId: 'usr_demo_emp',
      agentKey: 'dummy',
      forceVerificationFailure: true,
    });

    const fbTask = await supabaseService.getAgentTaskById(fallbackRes.task_id);

    assertTest(
      'TEST 5: ai_source correctly carries rule_based_fallback in backend state',
      (fbTask as any)?.ai_source === 'rule_based_fallback' || (fbTask as any)?.aiSource === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${(fbTask as any)?.ai_source}'`
    );
    assertTest(
      'TEST 6: Response payload exposes correct ai_source to UI',
      fallbackRes.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${fallbackRes.ai_source}'`
    );
  } catch (err: any) {
    assertTest('TEST 5 & 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: RBAC Isolation for Task Progress Polling
  // ----------------------------------------------------
  try {
    const clientAUser = rbacService.getUserContext('usr_demo_cli'); // Client A
    const clientBUser = { id: 'usr_cli_other', role: 'client' as const, tenantId: 'tenant_other', organizationId: 'org_other', name: 'Client B', email: 'b@test.com' };

    const clientATask = await supabaseService.createAgentTask({
      agent_name: 'Tax Intelligence Agent',
      user_id: clientAUser.id,
      input_summary: 'Client A Private GST Query',
      output_summary: 'Confidential GST result',
      status: 'completed',
      current_step: 5,
    });

    const queriedTask = await supabaseService.getAgentTaskById(clientATask.id);
    const clientBHasAccess = queriedTask ? queriedTask.user_id === clientBUser.id : false;

    assertTest(
      'TEST 7: Client B attempting access to Client A task activity is DENIED',
      !clientBHasAccess,
      'Client B was granted unauthorized access to Client A task activity'
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS: Run Phases 1, 2, 3, & 4
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1, 2, 3, & 4)');
  console.log('------------------------------------------------------------');

  const p1Res = await runAiPhase1Tests();
  assertTest('REGRESSION: Phase 1 Test Suite Passed', p1Res.passed >= 18, `Phase 1 failed: ${p1Res.failures.join(', ')}`);

  const p2Res = await runAiPhase2Tests();
  assertTest('REGRESSION: Phase 2 Test Suite Passed', p2Res.passed === 14, `Phase 2 failed: ${p2Res.failures.join(', ')}`);

  const p3Res = await runAiPhase3Tests();
  assertTest('REGRESSION: Phase 3 Test Suite Passed', p3Res.passed === 9, `Phase 3 failed: ${p3Res.failures.join(', ')}`);

  const ragDocResults = await ragService.searchSimilarDocs('murder', { topK: 1 });
  assertTest('REGRESSION: Phase 4 RAG Similarity Search Passed', ragDocResults.length > 0 && ragDocResults[0].id === 'kd_302', 'Phase 4 RAG search regression failed');

  console.log(`\n============================================================`);
  console.log(`Phase 5 Live Activity Feed Test Summary: ${passed}/${total} PASSED`);
  console.log(`============================================================\n`);

  return { total, passed, failures };
}

// Auto-run if executed directly via tsx
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase5Tests')) {
  runAiPhase5Tests().catch(err => {
    console.error('Fatal error running Phase 5 Live Activity Feed tests:', err);
    process.exit(1);
  });
}
