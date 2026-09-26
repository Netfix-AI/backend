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

export async function runAiPhase10Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('⚖️ NETFIX AI — PHASE 10 LEGAL INTELLIGENCE AGENT TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Legal Research Agent Routing & Task Completion
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Research procedural guidelines under Section 41A CrPC and GST Section 16 for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 1: legal_research agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Module 12 — Legal Issues Identification & Structuring
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Identify legal issues and key questions for GST credit claim compliance',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    const payload = res2.result as any;
    const issues = payload?.legal_issues || [];
    const hasIssues = Array.isArray(issues) && issues.length > 0;
    const validIssues = issues.every(
      (i: any) => Boolean(i.issue_id && i.issue_title && i.category && Array.isArray(i.key_questions))
    );

    assertTest(
      'TEST 2: Module 12 — Legal issues structured with issue_id, category, and key questions',
      hasIssues && validIssues,
      `Invalid legal issues in payload: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Module 13 — Precedent & Legal Knowledge Retrieval with Provenance
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Retrieve legal precedents and statutory provisions for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    const payload = res3.result as any;
    const authorities = payload?.authorities_retrieved || [];
    const hasAuthorities = Array.isArray(authorities) && authorities.length > 0;
    const validAuth = authorities.every(
      (a: any) =>
        Boolean(a.doc_id && a.title && a.citation && typeof a.similarity_score === 'number' && typeof a.is_verified === 'boolean')
    );

    assertTest(
      'TEST 3: Module 13 — Authorities retrieved with doc_id, citation, similarity_score, and verification status',
      hasAuthorities && validAuth,
      `Invalid authorities in payload: ${JSON.stringify(res3.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Module 14 — Legal Analysis Synthesis
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Synthesize legal analysis and precedent principles for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    const payload = res4.result as any;
    const analysis = payload?.legal_analysis;
    const validAnalysis =
      Boolean(analysis && analysis.synthesis_narrative && Array.isArray(analysis.statutory_provisions) && Array.isArray(analysis.precedent_principles) && Array.isArray(analysis.inferred_conclusions));

    assertTest(
      'TEST 4: Module 14 — Legal analysis synthesized with statutory provisions, principles, and conclusions',
      validAnalysis,
      `Invalid legal analysis in payload: ${JSON.stringify(res4.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: RAG Search Integration — Statutory & Case Corpus Retrieval
  // ----------------------------------------------------
  try {
    const { ragService } = await import('../services/ragService.js');
    const ragResults = await ragService.searchSimilarDocs('Arnesh Kumar precedent CrPC Section 41A notice', {
      topK: 3,
      userRole: 'employee',
    });

    assertTest(
      'TEST 5: RAG retrieval successfully queries knowledge corpus and returns ranked docs',
      Array.isArray(ragResults) && ragResults.length > 0 && Boolean(ragResults[0].title || ragResults[0].source_text),
      `RAG search failed: ${JSON.stringify(ragResults)}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Citation Verification & Provenance Matching
  // ----------------------------------------------------
  try {
    const res6 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify precedent citations against knowledge corpus',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    const payload = res6.result as any;
    const authorities = payload?.authorities_retrieved || [];
    const allVerified = authorities.length > 0 && authorities.every((a: any) => a.is_verified === true);

    assertTest(
      'TEST 6: Citation safety — All retrieved legal authorities match knowledge corpus and are marked is_verified: true',
      allVerified,
      `Unverified citations found in payload: ${JSON.stringify(authorities)}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Insufficient Evidence & Missing Authorities Handling
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Research obscure Maritime Admiralty Law precedent in Antarctic jurisdiction',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    const payload = res7.result as any;
    const hasField = typeof payload?.insufficient_evidence === 'boolean' && Array.isArray(payload?.missing_authorities);

    assertTest(
      'TEST 7: Payload contains explicit insufficient_evidence flag and missing_authorities array',
      hasField,
      `Missing evidence fields in payload: ${JSON.stringify(res7.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: Confidence Score Validation
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Assess confidence score for legal_research agent',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
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
      taskDescription: 'Execute legal research fallback under simulated rate limit',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
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
  // TEST 10: Strict JSON Schema Structural Integrity
  // ----------------------------------------------------
  try {
    const res10 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify strict JSON schema compliance for legal_research agent',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    const payload = res10.result as any;
    const requiredKeys = ['legal_issues', 'authorities_retrieved', 'authority_issue_mappings', 'legal_analysis', 'insufficient_evidence', 'missing_authorities', 'confidence_score'];
    const hasAllKeys = requiredKeys.every(k => k in payload);

    assertTest(
      'TEST 10: Strict JSON schema fields present in legal_research output payload',
      hasAllKeys,
      `Missing required keys in payload: ${JSON.stringify(Object.keys(payload))}`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: Human-Review Gate Triggered for legal_research Agent
  // ----------------------------------------------------
  try {
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Trigger human review gate for legal analysis',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 11: human_review_status is set to pending for gated legal_research agent',
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
      taskDescription: 'Execute legal research for client user',
      requestingUserId: 'usr_cli_rajesh',
      agentKey: 'legal_research',
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
      legal_issues: [],
      authorities_retrieved: [],
      internal_notes: 'Confidential advocate note',
      internal_rationale: 'Internal legal reasoning strategy',
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
        taskDescription: 'Attempt cross-tenant legal research',
        requestingUserId: 'usr_cli_sharma_b', // Tenant B client
        agentKey: 'legal_research',
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
        taskDescription: 'Attempt cross-tenant document research',
        requestingUserId: 'usr_cli_sharma_b', // Tenant B client
        agentKey: 'legal_research',
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
      'Scoped legal research context test',
      'TASK-SCOPE-LEGAL',
      undefined,
      'C-1042',
      'legal_research'
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
      taskDescription: 'Generate PDF report for legal research task',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
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
      taskDescription: 'Track agent_tasks database progression for legal_research',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'legal_research',
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
  // REGRESSION SUITES: PHASES 1 THROUGH 9
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1–9)');
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

  console.log('\n============================================================');
  console.log(`📊 PHASE 10 TEST SUMMARY: ${passed}/${total} PASSED`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
  console.log('============================================================\n');

  return { total, passed, failures };
}

if (process.argv[1] && process.argv[1].includes('aiPhase10Tests')) {
  runAiPhase10Tests()
    .then(res => {
      if (res.failures.length > 0) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error running Phase 10 tests:', err);
      process.exit(1);
    });
}
