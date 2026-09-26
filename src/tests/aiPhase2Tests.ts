import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { geminiService } from '../services/geminiService.js';
import type { OrchestrateRequest } from '../types/index.js';

export async function runAiPhase2Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🤖 NETFIX AI — PHASE 2 AI ORCHESTRATOR TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // EXIT CRITERION 1: Normal Dummy Task Progress
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Process general query task',
      requestingUserId: 'usr_demo_emp',
      agentKey: 'dummy',
    });

    assertTest(
      'EXIT CRITERION 1: Task status is completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
    assertTest(
      'EXIT CRITERION 1: Result is dummy_output',
      (res1.result as any)?.result === 'dummy_output',
      `Expected result 'dummy_output', got '${JSON.stringify(res1.result)}'`
    );
    assertTest(
      'EXIT CRITERION 1: Steps completed count > 0',
      res1.steps_completed > 0,
      `Expected steps_completed > 0, got ${res1.steps_completed}`
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // EXIT CRITERION 2: Forced Verification Failure Retry Loop
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Force verification failure test',
      requestingUserId: 'usr_demo_emp',
      agentKey: 'dummy',
      forceVerificationFailure: true,
    });

    assertTest(
      'EXIT CRITERION 2: Status is completed via fallback path',
      res2.status === 'completed',
      `Expected status 'completed', got '${res2.status}'`
    );
    assertTest(
      'EXIT CRITERION 2: ai_source is rule_based_fallback',
      res2.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${res2.ai_source}'`
    );
    assertTest(
      'EXIT CRITERION 2: verification_retries equals 2',
      res2.verification_retries === 2,
      `Expected 2 verification retries, got ${res2.verification_retries}`
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // EXIT CRITERION 3: Context Bundle Client RBAC Isolation
  // ----------------------------------------------------
  try {
    const bundle = await ultronOrchestrator.buildContextBundle('usr_demo_cli', 'Check my GST filing', 'TASK-TEST-RBAC');
    const crossTenantCases = bundle.cases.filter(
      c => c.clientId !== bundle.user.id && c.tenantId !== bundle.user.tenantId
    );

    assertTest(
      'EXIT CRITERION 3: Client context bundle contains 0 cross-tenant cases',
      crossTenantCases.length === 0,
      `Found ${crossTenantCases.length} leaked cross-tenant cases in bundle`
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // EXIT CRITERION 4: Role-Based Output Filtering (Client)
  // ----------------------------------------------------
  try {
    const unfilteredPayload = {
      summary: 'Public summary',
      internal_rationale: 'Secret internal reasoning',
      internal_notes: 'Private note',
    };
    const filtered = ultronOrchestrator.filterOutputByRole(unfilteredPayload, 'client');

    assertTest(
      'EXIT CRITERION 4: internal_rationale is stripped for client role',
      !('internal_rationale' in filtered),
      'internal_rationale key was not stripped'
    );
    assertTest(
      'EXIT CRITERION 4: internal_notes is stripped for client role',
      !('internal_notes' in filtered),
      'internal_notes key was not stripped'
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // EXIT CRITERION 5: Human-Review Gate for Drafting Agent
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft agreement for legal notice',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'drafting',
    });

    assertTest(
      'EXIT CRITERION 5: human_review_status is pending for drafting agent',
      res5.human_review_status === 'pending',
      `Expected human_review_status 'pending', got '${res5.human_review_status}'`
    );
    assertTest(
      'EXIT CRITERION 5: Client role receives pending_review placeholder',
      (res5.result as any)?.status === 'pending_review',
      `Expected result status 'pending_review', got '${JSON.stringify(res5.result)}'`
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // EXIT CRITERION 6: Keyword Fallback Classification
  // ----------------------------------------------------
  try {
    const origCall = geminiService.call.bind(geminiService);
    // Temporary mock for fallback simulation
    (geminiService as any).call = async () => ({ ai_source: 'rule_based_fallback' });

    const classRes = await ultronOrchestrator.classifyAndRoute('Please check GST tax returns');

    assertTest(
      'EXIT CRITERION 6: Keyword classification selects tax_intelligence for tax query',
      classRes.next_agent === 'tax_intelligence',
      `Expected next_agent 'tax_intelligence', got '${classRes.next_agent}'`
    );
    assertTest(
      'EXIT CRITERION 6: ai_source is rule_based_fallback',
      classRes.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${classRes.ai_source}'`
    );

    // Restore original gemini call method
    (geminiService as any).call = origCall;
  } catch (err: any) {
    assertTest('EXIT CRITERION 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // EXIT CRITERION 7: Verification Layer Gemini Fallback
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Run query with verification fallback',
      requestingUserId: 'usr_demo_emp',
      agentKey: 'dummy',
    });

    assertTest(
      'EXIT CRITERION 7: Task completes cleanly when verification succeeds',
      res7.status === 'completed',
      `Expected status 'completed', got '${res7.status}'`
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION 7: Execution thrown', false, err?.message);
  }

  console.log(`\n============================================================`);
  console.log(`Phase 2 AI Orchestrator Test Summary: ${passed}/${total} PASSED`);
  console.log(`============================================================\n`);

  return { total, passed, failures };
}

// Auto-run if executed directly via tsx
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase2Tests')) {
  runAiPhase2Tests().catch(err => {
    console.error('Fatal error running Phase 2 AI Orchestrator tests:', err);
    process.exit(1);
  });
}
