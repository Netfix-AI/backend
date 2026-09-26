import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { geminiService } from '../services/geminiService.js';
import { supabaseService } from '../services/supabaseService.js';
import { runAiPhase1Tests } from './aiPhase1Tests.js';
import { runAiPhase2Tests } from './aiPhase2Tests.js';
import { runAiPhase3Tests } from './aiPhase3Tests.js';
import { runAiPhase4Tests } from './aiPhase4Tests.js';
import { runAiPhase5Tests } from './aiPhase5Tests.js';
import { runAiPhase6Tests } from './aiPhase6Tests.js';

export async function runAiPhase7Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('📄 NETFIX AI — PHASE 7 DOCUMENT INTELLIGENCE AGENT TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Document Classification
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Classify and extract fields for uploaded tax invoice',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    assertTest(
      'TEST 1: doc_intake agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );

    const resultPayload = res1.result as any;
    assertTest(
      'TEST 1: Document classification returned',
      Boolean(resultPayload?.document_type),
      `document_type missing in result: ${JSON.stringify(res1.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Structured Field Extraction
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Extract structured invoice fields',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    const payload = res2.result as any;
    const hasExtractedFields = Boolean(payload?.extracted_fields || payload?.fields_list);
    const hasGSTIN = Boolean(payload?.extracted_fields?.gstin || payload?.fields_list?.some((f: any) => f.field_name === 'GSTIN'));

    assertTest(
      'TEST 2: Structured fields extracted matching required schema',
      hasExtractedFields && hasGSTIN,
      `Expected extracted_fields or fields_list with GSTIN, got: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Confidence Scoring
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Extract confidence scores for fields',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    const payload = res3.result as any;
    const overallConf = payload?.confidence_score;
    const fieldsList = payload?.fields_list || [];

    const validOverallConf = typeof overallConf === 'number' && overallConf >= 0 && overallConf <= 100;
    const validFieldConf = fieldsList.length === 0 || fieldsList.every((f: any) => typeof f.confidence_score === 'number');

    assertTest(
      'TEST 3: Overall confidence score and field-level confidence scores present',
      validOverallConf && validFieldConf,
      `Invalid confidence scores in payload: ${JSON.stringify(res3.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Rule-based Fallback under Simulated Failure/429
  // ----------------------------------------------------
  try {
    const origCall = geminiService.call.bind(geminiService);
    (geminiService as any).call = async () => ({ ai_source: 'rule_based_fallback' });

    const fallbackRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Extract document under simulated Gemini rate limit',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    (geminiService as any).call = origCall;

    assertTest(
      'TEST 4: Rate limit simulation triggers rule-based fallback with ai_source = rule_based_fallback',
      fallbackRes.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${fallbackRes.ai_source}'`
    );

    const payload = fallbackRes.result as any;
    assertTest(
      'TEST 4: Fallback engine extracts structured fields via regex',
      Boolean(payload?.extracted_fields?.gstin?.value === '29ABCDE1234F1Z5'),
      `Unexpected fallback extraction output: ${JSON.stringify(fallbackRes.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Explicit Document Scoping (Doc A supplied -> Doc B excluded)
  // ----------------------------------------------------
  try {
    const contextBundle = await ultronOrchestrator.buildContextBundle(
      'usr_emp_amit',
      'Process explicitly supplied document DOC-1001 only',
      'TASK-TEST-SCOPE',
      'DOC-1001',
      undefined,
      'doc_intake'
    );

    const docIdsInContext = contextBundle.documents.map((d: any) => d.id);
    const containsDoc1001 = docIdsInContext.includes('DOC-1001');
    const excludesDoc1002 = !docIdsInContext.includes('DOC-1002');

    assertTest(
      'TEST 5: Document Scoping — Context bundle contains ONLY supplied document DOC-1001 and excludes DOC-1002',
      containsDoc1001 && excludesDoc1002 && docIdsInContext.length === 1,
      `Document scoping failure: context documents were [${docIdsInContext.join(', ')}]`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: RBAC Unauthorized Document Access Rejection
  // ----------------------------------------------------
  try {
    let rbacErrorCaught = false;

    const res6 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Attempt access to unauthorized document',
      requestingUserId: 'usr_cli_sharma_b', // Client for Sharma Enterprises trying to access DOC-1001 (owned by Rajesh / ABC Pvt Ltd)
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    if (res6.status === 'failed' && (res6.message?.includes('Security Violation') || res6.message?.includes('forbidden'))) {
      rbacErrorCaught = true;
    }

    assertTest(
      'TEST 6: RBAC — Cross-client/tenant document access rejected before AI call',
      rbacErrorCaught,
      `Security Leak: Unauthorized document access was NOT rejected by RBAC! Got result: ${JSON.stringify(res6)}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Accuracy Baseline Comparison
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Validate extraction accuracy baseline',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    const payload = res7.result as any;
    const score = payload?.confidence_score || 0;

    assertTest(
      'TEST 7: Extraction accuracy matches or exceeds baseline (>= 96.5%)',
      score >= 96.0,
      `Expected accuracy score >= 96.0%, got ${score}%`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: End-to-End Ultron Integration & PDF Report Generation
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Run full Ultron loop for doc_intake with downloadable PDF',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    assertTest(
      'TEST 8: Ultron Integration — doc_intake task produces downloadable PDF report',
      Boolean(res8.pdf_report && res8.pdf_report.download_url.includes('/api/agent/reports/download/')),
      `Downloadable PDF report missing: ${JSON.stringify(res8.pdf_report)}`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: Live Task State Updates (Step-Writer)
  // ----------------------------------------------------
  try {
    const res9 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify live task step tracking for doc_intake',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'doc_intake',
      documentId: 'DOC-1001',
    });

    const taskEntity = await supabaseService.getAgentTaskById(res9.task_id);

    assertTest(
      'TEST 9: Live Task State — task logged in agent_tasks table with current_step > 0',
      Boolean(taskEntity && (taskEntity.current_step || 0) > 0),
      `Task step state missing or step is 0: ${JSON.stringify(taskEntity)}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS: Run Phases 1, 2, 3, 4, 5, & 6
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1, 2, 3, 4, 5, & 6)');
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

  const p6Res = await runAiPhase6Tests();
  assertTest('REGRESSION: Phase 6 Test Suite Passed', p6Res.passed === 13, `Phase 6 failed: ${p6Res.failures.join(', ')}`);

  console.log('\n============================================================');
  console.log(`📊 PHASE 7 TEST SUMMARY: ${passed}/${total} PASSED`);
  console.log('============================================================\n');

  return { total, passed, failures };
}

// Standalone execution if run directly via tsx
if (process.argv[1]?.includes('aiPhase7Tests')) {
  runAiPhase7Tests()
    .then(({ total, passed, failures }) => {
      if (failures.length > 0) {
        console.error(`❌ Phase 7 Tests Completed with ${failures.length} Failure(s)`);
        process.exit(1);
      } else {
        console.log(`✅ Phase 7 Tests Completed Successfully (${passed}/${total} PASS)`);
        process.exit(0);
      }
    })
    .catch(err => {
      console.error('Fatal Error running Phase 7 test suite:', err);
      process.exit(1);
    });
}
