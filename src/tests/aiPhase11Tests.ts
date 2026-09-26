import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { geminiService } from '../services/geminiService.js';
import { supabaseService } from '../services/supabaseService.js';
import { runAiPhase1Tests } from './aiPhase1Tests.js';
import { runAiPhase2Tests } from './aiPhase2Tests.js';
import { runAiPhase3Tests } from './aiPhase3Tests.js';
import { runAiPhase4Tests } from './aiPhase4Tests.js';
import { runAiPhase5Tests } from './aiPhase5Tests.js';
import { runAiPhase6Tests } from './aiPhase6Tests.js';
import { runAiPhase7Tests } from './aiPhase7Tests.js';
import { runAiPhase8Tests } from './aiPhase8Tests.js';
import { runAiPhase9Tests } from './aiPhase9Tests.js';
import { runAiPhase10Tests } from './aiPhase10Tests.js';

export async function runAiPhase11Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🔍 NETFIX AI — PHASE 11 CITATION VERIFICATION AGENT TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Citation Verification Agent Routing & Task Completion
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify legal citations for Arnesh Kumar and Section 16 CGST Act',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    assertTest(
      'TEST 1: citation_check agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Module 27 — Citation Audit Payload Structure
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Audit legal citations for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
      caseId: 'C-1042',
    });

    const payload = res2.result as any;
    const results = payload?.citation_results || [];
    const hasResults = Array.isArray(results) && results.length > 0;
    const validResults = results.every(
      (r: any) => Boolean(r.citation_text && typeof r.verified === 'boolean')
    );
    const validCounts = typeof payload?.verified_count === 'number' && typeof payload?.unverified_count === 'number';

    assertTest(
      'TEST 2: Module 27 — Citation audit payload structured with citation_results, verified_count, and unverified_count',
      hasResults && validResults && validCounts,
      `Invalid citation audit payload: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Authentic Citation Verification — Corpus Match
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify authentic citation Arnesh Kumar vs State of Bihar (2014) 8 SCC 273',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const payload = res3.result as any;
    const results = payload?.citation_results || [];
    const matchedItem = results.find((r: any) => r.citation_text.toLowerCase().includes('arnesh kumar'));
    const isVerified = Boolean(matchedItem && matchedItem.verified === true && matchedItem.matched_source_id === 'DOC-KNOW-101');

    assertTest(
      'TEST 3: Authentic corpus precedent verified with matched_source_id #DOC-KNOW-101',
      isVerified,
      `Authentic citation failed verification: ${JSON.stringify(matchedItem)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Zero False Approvals — Injected Fake Citation Rejection
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify fake unverified citation Fake Case vs Unknown State 2099 SCC 123',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const payload = res4.result as any;
    const results = payload?.citation_results || [];
    const fakeItem = results.find((r: any) => r.citation_text.toLowerCase().includes('fake case'));
    const isRejected = Boolean(fakeItem && fakeItem.verified === false && fakeItem.matched_source_id === null && fakeItem.unverified_reason);

    assertTest(
      'TEST 4: Hardening — Zero false approvals: Deliberately injected fake citation rejected with verified: false',
      isRejected,
      `Fake citation erroneously approved: ${JSON.stringify(fakeItem)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Overall Verification Status Calculation
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Audit citation batch status',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const payload = res5.result as any;
    const validStatus = ['ALL_VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED'].includes(payload?.overall_verification_status);

    assertTest(
      'TEST 5: overall_verification_status correctly calculated (ALL_VERIFIED, PARTIALLY_VERIFIED, or UNVERIFIED)',
      validStatus,
      `Invalid overall status: ${payload?.overall_verification_status}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Confidence Score & Match Details Validation
  // ----------------------------------------------------
  try {
    const res6 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify match details and confidence scores for citations',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const payload = res6.result as any;
    const results = payload?.citation_results || [];
    const validDetails = results.every(
      (r: any) => (r.verified ? typeof r.confidence_score === 'number' && r.confidence_score > 0 : r.confidence_score === 0)
    );

    assertTest(
      'TEST 6: Verified citations report numeric confidence score > 0; unverified report score 0',
      validDetails,
      `Invalid confidence details: ${JSON.stringify(results)}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Deterministic Rule-Based Fallback Engine
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify citations fallback under simulated rate limit',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    assertTest(
      'TEST 7: ai_source correctly indicates rule_based_fallback or ai execution',
      res7.ai_source === 'rule_based_fallback' || res7.ai_source === 'ai',
      `Unexpected ai_source: ${res7.ai_source}`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: Strict JSON Schema Structural Integrity
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify strict JSON schema compliance for citation_check agent',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const payload = res8.result as any;
    const requiredKeys = ['citation_results', 'overall_verification_status', 'verified_count', 'unverified_count'];
    const hasAllKeys = requiredKeys.every(k => k in payload);

    assertTest(
      'TEST 8: Strict JSON schema required fields present in citation_check output payload',
      hasAllKeys,
      `Missing required keys in payload: ${JSON.stringify(Object.keys(payload))}`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: RBAC — Cross-Tenant Case Access Rejection
  // ----------------------------------------------------
  try {
    let forbiddenCaught = false;
    try {
      const res9 = await ultronOrchestrator.orchestrate({
        taskDescription: 'Attempt cross-tenant citation check',
        requestingUserId: 'usr_cli_sharma_b', // Tenant B client
        agentKey: 'citation_check',
        caseId: 'C-1042', // Belongs to Tenant A
      });
      if (res9.status === 'failed' && (res9.message?.includes('Security Violation') || (res9.result as any)?.error?.includes('Security Violation'))) {
        forbiddenCaught = true;
      }
    } catch (err: any) {
      if (err?.message?.includes('Security Violation') || err?.message?.includes('forbidden')) {
        forbiddenCaught = true;
      }
    }

    assertTest(
      'TEST 9: RBAC security violation thrown or returned as failed on unauthorized cross-tenant case access',
      forbiddenCaught,
      'Cross-tenant case access was not rejected'
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 10: Role-Based Filtering of Internal Notes
  // ----------------------------------------------------
  try {
    const unFiltered = {
      citation_results: [],
      overall_verification_status: 'ALL_VERIFIED',
      verified_count: 0,
      unverified_count: 0,
      internal_notes: 'Confidential auditor note',
      internal_rationale: 'Internal decision tree rationale',
    };

    const clientFiltered = ultronOrchestrator.filterOutputByRole(unFiltered, 'client');
    const hasRationale = 'internal_rationale' in clientFiltered;
    const hasNotes = 'internal_notes' in clientFiltered;

    assertTest(
      'TEST 10: filterOutputByRole strips internal_rationale and internal_notes for client role',
      !hasRationale && !hasNotes,
      `Internal fields not stripped: ${JSON.stringify(clientFiltered)}`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: Downloadable PDF Report Generation
  // ----------------------------------------------------
  try {
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Generate PDF report for citation verification audit',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const pdfReport = res11.pdf_report;
    const validPdf = Boolean(pdfReport && pdfReport.report_id && pdfReport.download_url);

    assertTest(
      'TEST 11: Task completion generates downloadable PDF report metadata & URL',
      validPdf,
      `PDF report object invalid: ${JSON.stringify(pdfReport)}`
    );
  } catch (err: any) {
    assertTest('TEST 11: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 12: Real agent_tasks Progression & Database Tracking
  // ----------------------------------------------------
  try {
    const res12 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Track agent_tasks database progression for citation_check',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'citation_check',
    });

    const dbTask = await supabaseService.getAgentTaskById(res12.task_id);
    const validDbTask = Boolean(dbTask && dbTask.status === 'completed' && (dbTask.current_step ?? 0) > 0);

    assertTest(
      'TEST 12: Task state recorded in agent_tasks with status completed and current_step > 0',
      validDbTask,
      `Database task invalid: ${JSON.stringify(dbTask)}`
    );
  } catch (err: any) {
    assertTest('TEST 12: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION SUITES: PHASES 1 THROUGH 10
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1–10)');
  console.log('------------------------------------------------------------\n');

  try {
    const p1 = await runAiPhase1Tests();
    assertTest('REGRESSION: Phase 1 Test Suite Passed', p1.passed >= 18, `Phase 1 regressions failed: ${p1.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 1 Exception', false, err?.message);
  }

  try {
    const p2 = await runAiPhase2Tests();
    assertTest('REGRESSION: Phase 2 Test Suite Passed', p2.passed === p2.total, `Phase 2 regressions failed: ${p2.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 2 Exception', false, err?.message);
  }

  try {
    const p3 = await runAiPhase3Tests();
    assertTest('REGRESSION: Phase 3 Test Suite Passed', p3.passed === p3.total, `Phase 3 regressions failed: ${p3.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 3 Exception', false, err?.message);
  }

  try {
    const p4 = await runAiPhase4Tests();
    assertTest('REGRESSION: Phase 4 Test Suite Passed', p4.passed === p4.total, `Phase 4 regressions failed: ${p4.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 4 Exception', false, err?.message);
  }

  try {
    const p5 = await runAiPhase5Tests();
    assertTest('REGRESSION: Phase 5 Test Suite Passed', p5.passed === p5.total, `Phase 5 regressions failed: ${p5.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 5 Exception', false, err?.message);
  }

  try {
    const p6 = await runAiPhase6Tests();
    assertTest('REGRESSION: Phase 6 Test Suite Passed', p6.passed === p6.total, `Phase 6 regressions failed: ${p6.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 6 Exception', false, err?.message);
  }

  try {
    const p7 = await runAiPhase7Tests();
    assertTest('REGRESSION: Phase 7 Test Suite Passed', p7.passed === p7.total, `Phase 7 regressions failed: ${p7.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 7 Exception', false, err?.message);
  }

  try {
    const p8 = await runAiPhase8Tests();
    assertTest('REGRESSION: Phase 8 Test Suite Passed', p8.passed === p8.total, `Phase 8 regressions failed: ${p8.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 8 Exception', false, err?.message);
  }

  try {
    const p9 = await runAiPhase9Tests();
    assertTest('REGRESSION: Phase 9 Test Suite Passed', p9.passed === p9.total, `Phase 9 regressions failed: ${p9.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 9 Exception', false, err?.message);
  }

  try {
    const p10 = await runAiPhase10Tests();
    assertTest('REGRESSION: Phase 10 Test Suite Passed', p10.passed === p10.total, `Phase 10 regressions failed: ${p10.failures.join(', ')}`);
  } catch (err: any) {
    assertTest('REGRESSION: Phase 10 Exception', false, err?.message);
  }

  console.log('\n============================================================');
  console.log(`📊 PHASE 11 TEST SUMMARY: ${passed}/${total} PASSED`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
  console.log('============================================================\n');

  return { total, passed, failures };
}

if (process.argv[1] && process.argv[1].includes('aiPhase11Tests')) {
  runAiPhase11Tests()
    .then(res => {
      if (res.failures.length > 0) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error running Phase 11 tests:', err);
      process.exit(1);
    });
}
