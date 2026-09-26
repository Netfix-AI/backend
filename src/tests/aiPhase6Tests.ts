import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { geminiService } from '../services/geminiService.js';
import { runAiPhase1Tests } from './aiPhase1Tests.js';
import { runAiPhase2Tests } from './aiPhase2Tests.js';
import { runAiPhase3Tests } from './aiPhase3Tests.js';
import { runAiPhase4Tests } from './aiPhase4Tests.js';
import { runAiPhase5Tests } from './aiPhase5Tests.js';

export async function runAiPhase6Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🗣️ NETFIX AI — PHASE 6 COMMUNICATION & REPORTING AGENT TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Real Communication & Reporting Execution
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Summarize my recent case status and write a report narrative',
      requestingUserId: 'usr_demo_emp',
      agentKey: 'comms_reporting',
    });

    assertTest(
      'TEST 1: comms_reporting agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
    assertTest(
      'TEST 2: comms_reporting result contains response_text',
      Boolean((res1.result as any)?.response_text),
      `response_text missing in result: ${JSON.stringify(res1.result)}`
    );
    assertTest(
      'TEST 3: Employee role receives internal_notes and internal_rationale',
      Boolean((res1.result as any)?.internal_notes) && Boolean((res1.result as any)?.internal_rationale),
      'internal_notes or internal_rationale missing for employee role'
    );
  } catch (err: any) {
    assertTest('TEST 1-3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4 & 5: Internal Notes Protection for Client Role
  // ----------------------------------------------------
  try {
    const resClient = await ultronOrchestrator.orchestrate({
      taskDescription: 'Provide my client account report narrative',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'comms_reporting',
    });

    const hasInternalNotes = 'internal_notes' in (resClient.result as object);
    const hasInternalRationale = 'internal_rationale' in (resClient.result as object);

    assertTest(
      'TEST 4: Client role result DOES NOT contain internal_notes',
      !hasInternalNotes,
      'Security Leak: internal_notes exposed to client role!'
    );
    assertTest(
      'TEST 5: Client role result DOES NOT contain internal_rationale',
      !hasInternalRationale,
      'Security Leak: internal_rationale exposed to client role!'
    );
  } catch (err: any) {
    assertTest('TEST 4 & 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Deterministic Fallback under Simulated Rate Limit
  // ----------------------------------------------------
  try {
    const origCall = geminiService.call.bind(geminiService);
    (geminiService as any).call = async () => ({ ai_source: 'rule_based_fallback' });

    const fallbackRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Test comms_reporting fallback under rate limit',
      requestingUserId: 'usr_demo_emp',
      agentKey: 'comms_reporting',
    });

    (geminiService as any).call = origCall;

    assertTest(
      'TEST 6: Rate limit simulation triggers rule-based fallback with ai_source = rule_based_fallback',
      fallbackRes.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${fallbackRes.ai_source}'`
    );
    assertTest(
      'TEST 7: Fallback produces non-empty narrative response_text',
      Boolean((fallbackRes.result as any)?.response_text?.includes('Rule-Based Narrative')),
      `Unexpected fallback response: ${JSON.stringify(fallbackRes.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 6 & 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: PDF Report Export Integration for Real Agent
  // ----------------------------------------------------
  try {
    const pdfRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Generate downloadable PDF report narrative',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'comms_reporting',
    });

    assertTest(
      'EXIT CRITERION: comms_reporting task ends with a real downloadable PDF',
      Boolean(pdfRes.pdf_report && pdfRes.pdf_report.download_url.includes('/api/agent/reports/download/')),
      'pdf_report download URL missing for completed comms_reporting task'
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS: Run Phases 1, 2, 3, 4, & 5
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1, 2, 3, 4, & 5)');
  console.log('------------------------------------------------------------');

  const p1Res = await runAiPhase1Tests();
  assertTest('REGRESSION: Phase 1 Test Suite Passed', p1Res.passed >= 18, `Phase 1 failed: ${p1Res.failures.join(', ')}`);

  const p2Res = await runAiPhase2Tests();
  assertTest('REGRESSION: Phase 2 Test Suite Passed', p2Res.passed === 14, `Phase 2 failed: ${p2Res.failures.join(', ')}`);

  const p3Res = await runAiPhase3Tests();
  assertTest('REGRESSION: Phase 3 Test Suite Passed', p3Res.passed === 9, `Phase 3 failed: ${p3Res.failures.join(', ')}`);

  const p4Res = await runAiPhase4Tests();
  assertTest('REGRESSION: Phase 4 Test Suite Passed', p4Res.passed === 13, `Phase 4 failed: ${p4Res.failures.join(', ')}`);

  const p5Res = await runAiPhase5Tests();
  assertTest('REGRESSION: Phase 5 Test Suite Passed', p5Res.passed === 11, `Phase 5 failed: ${p5Res.failures.join(', ')}`);

  console.log(`\n============================================================`);
  console.log(`Phase 6 Communication & Reporting Agent Test Summary: ${passed}/${total} PASSED`);
  console.log(`============================================================\n`);

  return { total, passed, failures };
}

// Auto-run if executed directly via tsx
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase6Tests')) {
  runAiPhase6Tests().catch(err => {
    console.error('Fatal error running Phase 6 tests:', err);
    process.exit(1);
  });
}
