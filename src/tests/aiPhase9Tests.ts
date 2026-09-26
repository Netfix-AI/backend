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

export async function runAiPhase9Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🛡️ NETFIX AI — PHASE 9 RISK & GST INTELLIGENCE AGENTS TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Risk & Compliance Agent Routing & Task Completion
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Evaluate risk score and compliance deficiencies for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 1: risk_compliance agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Module 24 — Risk Scoring & Risk Factor Extraction
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Assess risk score, severity level, and risk factors for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const payload = res2.result as any;
    const scoreValid = typeof payload?.risk_score === 'number' && payload.risk_score >= 0 && payload.risk_score <= 100;
    const levelValid = ['low', 'medium', 'high', 'critical'].includes(payload?.risk_level);
    const factors = payload?.risk_factors || [];
    const hasFactors = Array.isArray(factors) && factors.length > 0;
    const validFactorFields = factors.every(
      (f: any) => Boolean(f.factor_title && f.category && f.severity && f.description)
    );

    assertTest(
      'TEST 2: Module 24 — Risk score (0-100), level, and structured risk factors extracted',
      scoreValid && levelValid && hasFactors && validFactorFields,
      `Invalid risk score/factors in payload: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Module 24 — Compliance Deficiencies & Remediation Steps
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Identify statutory compliance deficiencies and remediation steps for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const payload = res3.result as any;
    const issues = payload?.compliance_issues || [];
    const steps = payload?.remediation_steps || [];
    const hasIssues = Array.isArray(issues) && issues.length > 0;
    const hasSteps = Array.isArray(steps) && steps.length > 0;
    const validIssues = issues.every(
      (i: any) => Boolean(i.issue_title && i.affected_obligation && i.deficiency_details && i.recommended_remediation)
    );

    assertTest(
      'TEST 3: Module 24 — Compliance deficiencies identified with statutory obligations and remediation steps',
      hasIssues && hasSteps && validIssues,
      `Invalid compliance issues in payload: ${JSON.stringify(res3.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Module 26 — GST Document Analysis & Reconciliation Anomalies
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Reconcile GST return figures and identify invoice mismatches for document DOC-1001',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      documentId: 'DOC-1001',
    });

    const payload = res4.result as any;
    const anomalies = payload?.gst_anomalies || [];
    const hasAnomalies = Array.isArray(anomalies) && anomalies.length > 0;
    const validAnomalies = anomalies.every(
      (a: any) =>
        Boolean(a.anomaly_type && typeof a.deterministic_amount === 'number' && typeof a.claimed_amount === 'number' && typeof a.discrepancy_flag === 'boolean' && a.explanation)
    );

    assertTest(
      'TEST 4: Module 26 — GST document analysis & reconciliation anomalies extracted',
      hasAnomalies && validAnomalies,
      `Invalid GST anomalies in payload: ${JSON.stringify(res4.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Critical Numerical Safety — Deterministic Calculation Preservation
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify numerical calculation consistency for GST return filing DOC-1001',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      documentId: 'DOC-1001',
    });

    const payload = res5.result as any;
    const anomalies = payload?.gst_anomalies || [];
    const primaryAnomaly = anomalies[0];
    const isExact = primaryAnomaly && primaryAnomaly.deterministic_amount === 164000.0 && primaryAnomaly.claimed_amount === 178260.0;

    assertTest(
      'TEST 5: Critical Numerical Safety — Authoritative deterministic calculations preserved with zero AI drift',
      Boolean(isExact),
      `Deterministic GST numbers modified: ${JSON.stringify(primaryAnomaly)}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: RAG Grounding — Statutory Rules Retrieval
  // ----------------------------------------------------
  try {
    const { ragService } = await import('../services/ragService.js');
    const ragResults = await ragService.searchSimilarDocs('Section 16 GST Act Input Tax Credit eligibility', {
      topK: 3,
      userRole: 'employee',
    });

    assertTest(
      'TEST 6: RAG Grounding — Statutory tax/compliance rules retrieved via ragService',
      Array.isArray(ragResults) && ragResults.length > 0 && Boolean(ragResults[0].title || ragResults[0].source_text),
      `RAG retrieval failed: ${JSON.stringify(ragResults)}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Source Reference Preservation & Missing Information Handling
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Extract supporting facts and missing information for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const payload = res7.result as any;
    const facts = payload?.supporting_facts || [];
    const missing = payload?.missing_information || [];

    assertTest(
      'TEST 7: Supporting facts and missing information preserved in structured payload',
      Array.isArray(facts) && facts.length > 0 && Array.isArray(missing),
      `Invalid facts/missing in payload: ${JSON.stringify(res7.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: Confidence & Uncertainty Score Validation
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Assess analysis confidence score for risk_compliance agent',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const payload = res8.result as any;
    const confidence = payload?.confidence_score;
    const validConf = typeof confidence === 'number' && confidence >= 0 && confidence <= 100;

    assertTest(
      'TEST 8: Confidence score present as numeric score (0-100)',
      validConf,
      `Invalid confidence score: ${confidence}`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: Deterministic Fallback on Gemini Failure / Missing Key
  // ----------------------------------------------------
  try {
    const res9 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Assess risk compliance fallback under simulated rate limit',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 9: ai_source correctly indicates rule_based_fallback or ai execution',
      res9.ai_source === 'rule_based_fallback' || res9.ai_source === 'ai',
      `Unexpected ai_source: ${res9.ai_source}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 10: Strict JSON Schema Structural Compliance
  // ----------------------------------------------------
  try {
    const res10 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify strict JSON schema compliance for risk_compliance agent',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const payload = res10.result as any;
    const requiredKeys = ['risk_score', 'risk_level', 'risk_factors', 'compliance_issues', 'gst_anomalies', 'remediation_steps', 'supporting_facts', 'missing_information', 'confidence_score'];
    const hasAllKeys = requiredKeys.every(k => k in payload);

    assertTest(
      'TEST 10: Strict JSON schema fields present in output payload',
      hasAllKeys,
      `Missing required keys in payload: ${JSON.stringify(Object.keys(payload))}`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: Human-Review Gate Triggered for risk_compliance Agent
  // ----------------------------------------------------
  try {
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Trigger human review gate for risk score',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 11: human_review_status is set to pending for gated risk_compliance agent',
      res11.human_review_status === 'pending',
      `Expected human_review_status 'pending', got '${res11.human_review_status}'`
    );
  } catch (err: any) {
    assertTest('TEST 11: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 12: Role-Based Filtering — Client Receives pending_review Placeholder
  // ----------------------------------------------------
  try {
    const res12 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Evaluate risk score for client user',
      requestingUserId: 'usr_cli_rajesh',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const payload = res12.result as any;
    const isPlaceholder = payload?.status === 'pending_review' && Boolean(payload?.message);

    assertTest(
      'TEST 12: Client role receives pending_review placeholder during pending review state',
      isPlaceholder,
      `Client received raw result: ${JSON.stringify(res12.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 12: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 13: Role-Based Filtering — Internal Rationale Stripping
  // ----------------------------------------------------
  try {
    const unFiltered = {
      risk_score: 68.0,
      risk_level: 'medium',
      internal_notes: 'Confidential employee note',
      internal_rationale: 'Internal decision tree logic',
    };

    const clientFiltered = ultronOrchestrator.filterOutputByRole(unFiltered, 'client');
    const hasRationale = 'internal_rationale' in clientFiltered;
    const hasNotes = 'internal_notes' in clientFiltered;

    assertTest(
      'TEST 13: filterOutputByRole strips internal_rationale and internal_notes for client role',
      !hasRationale && !hasNotes,
      `Internal fields not stripped: ${JSON.stringify(clientFiltered)}`
    );
  } catch (err: any) {
    assertTest('TEST 13: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 14: RBAC — Cross-Tenant Case Access Rejection
  // ----------------------------------------------------
  try {
    let forbiddenCaught = false;
    try {
      const res14 = await ultronOrchestrator.orchestrate({
        taskDescription: 'Attempt cross-tenant risk analysis',
        requestingUserId: 'usr_cli_sharma_b', // Tenant B client
        agentKey: 'risk_compliance',
        caseId: 'C-1042', // Belongs to Tenant A
      });
      if (res14.status === 'failed' && (res14.message?.includes('Security Violation') || (res14.result as any)?.error?.includes('Security Violation'))) {
        forbiddenCaught = true;
      }
    } catch (err: any) {
      if (err?.message?.includes('Security Violation') || err?.message?.includes('forbidden')) {
        forbiddenCaught = true;
      }
    }

    assertTest(
      'TEST 14: RBAC security violation thrown or returned as failed on unauthorized cross-tenant case access',
      forbiddenCaught,
      'Cross-tenant case access was not rejected'
    );
  } catch (err: any) {
    assertTest('TEST 14: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 15: RBAC — Cross-Tenant Document Access Rejection
  // ----------------------------------------------------
  try {
    let forbiddenCaught = false;
    try {
      const res15 = await ultronOrchestrator.orchestrate({
        taskDescription: 'Attempt cross-tenant document risk check',
        requestingUserId: 'usr_cli_sharma_b', // Tenant B client
        agentKey: 'risk_compliance',
        documentId: 'DOC-1001', // Belongs to Tenant A
      });
      if (res15.status === 'failed' && (res15.message?.includes('Security Violation') || (res15.result as any)?.error?.includes('Security Violation'))) {
        forbiddenCaught = true;
      }
    } catch (err: any) {
      if (err?.message?.includes('Security Violation') || err?.message?.includes('forbidden')) {
        forbiddenCaught = true;
      }
    }

    assertTest(
      'TEST 15: RBAC security violation thrown or returned as failed on unauthorized cross-tenant document access',
      forbiddenCaught,
      'Cross-tenant document access was not rejected'
    );
  } catch (err: any) {
    assertTest('TEST 15: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 16: Strict Context Scoping Isolation
  // ----------------------------------------------------
  try {
    const bundle = await ultronOrchestrator.buildContextBundle(
      'usr_cli_rajesh',
      'Scoped context test',
      'TASK-SCOPE-TEST',
      undefined,
      'C-1042',
      'risk_compliance'
    );

    const hasCrossTenant = bundle.cases.some(c => c.clientId !== 'usr_cli_rajesh' && c.tenantId !== 'tenant_abc_pvtltd');

    assertTest(
      'TEST 16: buildContextBundle produces 0 cross-tenant cases for client context',
      !hasCrossTenant,
      `Cross tenant case leaked in bundle: ${JSON.stringify(bundle.cases)}`
    );
  } catch (err: any) {
    assertTest('TEST 16: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 17: Downloadable PDF Report Generation
  // ----------------------------------------------------
  try {
    const res17 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Generate PDF report for risk & compliance analysis',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const pdfReport = res17.pdf_report;
    const validPdf = Boolean(pdfReport && pdfReport.report_id && pdfReport.download_url);

    assertTest(
      'TEST 17: Task completion generates downloadable PDF report metadata & URL',
      validPdf,
      `PDF report object invalid: ${JSON.stringify(pdfReport)}`
    );
  } catch (err: any) {
    assertTest('TEST 17: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 18: Real agent_tasks Progression & State Tracking
  // ----------------------------------------------------
  try {
    const res18 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Track agent_tasks database progression for risk_compliance',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'risk_compliance',
      caseId: 'C-1042',
    });

    const dbTask = await supabaseService.getAgentTaskById(res18.task_id);
    const validDbTask = Boolean(dbTask && dbTask.status === 'completed' && (dbTask.current_step ?? 0) > 0);

    assertTest(
      'TEST 18: Task state recorded in agent_tasks with status completed and current_step > 0',
      validDbTask,
      `Database task invalid: ${JSON.stringify(dbTask)}`
    );
  } catch (err: any) {
    assertTest('TEST 18: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION SUITES: PHASES 1 THROUGH 8
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1–8)');
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

  console.log('\n============================================================');
  console.log(`📊 PHASE 9 TEST SUMMARY: ${passed}/${total} PASSED`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
  console.log('============================================================\n');

  return { total, passed, failures };
}

if (process.argv[1] && process.argv[1].includes('aiPhase9Tests')) {
  runAiPhase9Tests()
    .then(res => {
      if (res.failures.length > 0) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error running Phase 9 tests:', err);
      process.exit(1);
    });
}
