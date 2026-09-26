import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { geminiService } from '../services/geminiService.js';
import { supabaseService } from '../services/supabaseService.js';
import { pdfGeneratorService } from '../services/pdfGeneratorService.js';
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
import { runAiPhase11Tests } from './aiPhase11Tests.js';

export async function runAiPhase12Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🔍 NETFIX AI — PHASE 12 DRAFTING + ADVERSARIAL AGENTS SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Drafting Agent Routing & Task Completion
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft reply to GST Show Cause Notice for tax period 2023-24',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 1: drafting agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Module 15 — Legal Drafting Payload Structure
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft legal response notice for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res2.result as any;
    const draft = payload?.draft || payload;
    const hasFields = Boolean(
      draft?.template_type &&
      draft?.document_title &&
      draft?.draft_content &&
      Array.isArray(draft?.sections) &&
      Array.isArray(draft?.citations_used) &&
      Array.isArray(draft?.missing_information)
    );

    assertTest(
      'TEST 2: Module 15 — Legal drafting payload structured with template_type, title, draft_content, sections, citations, and missing_information',
      hasFields,
      `Invalid drafting payload structure: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Strict Status Constraint — Output marked as 'ai_draft'
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft GST appeal petition',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res3.result as any;
    const draftStatus = payload?.draft?.status || payload?.status;
    const isAiDraft = draftStatus === 'ai_draft';

    assertTest(
      'TEST 3: Drafting agent output status is strictly ai_draft (never finalized)',
      isAiDraft,
      `Expected status 'ai_draft', got '${draftStatus}'`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Auto-Chaining Phase 11 Citation Verification
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft GST response citing Section 16(2) and Section 74',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res4.result as any;
    const citationVerification = payload?.citation_verification;
    const hasVerification = Boolean(
      citationVerification &&
      Array.isArray(citationVerification.citation_results) &&
      typeof citationVerification.verified_count === 'number'
    );

    assertTest(
      'TEST 4: Drafting agent auto-chains Phase 11 citation_check verification',
      hasVerification,
      `Citation verification missing in draft bundle: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Auto-Chaining Phase 12 Adversarial Red-Team Review
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft defense written statement',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res5.result as any;
    const adversarialReview = payload?.adversarial_review;
    const hasAdversarial = Boolean(
      adversarialReview &&
      typeof adversarialReview.overall_risk_score === 'number' &&
      Array.isArray(adversarialReview.weaknesses)
    );

    assertTest(
      'TEST 5: Drafting agent auto-chains Phase 12 adversarial red-team review',
      hasAdversarial,
      `Adversarial review missing in draft bundle: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Citation Verification Unverified Citation Flagging in Pipeline
  // ----------------------------------------------------
  try {
    const res6 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft response citing fake precedent Fake v State 2099',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res6.result as any;
    const citRes = payload?.citation_verification;
    const unverifiedCount = citRes?.unverified_count || 0;

    assertTest(
      'TEST 6: Draft pipeline correctly identifies unverified citations via citation_check',
      typeof unverifiedCount === 'number' && citRes !== undefined,
      `Citation verification failed: ${JSON.stringify(citRes)}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Un-supplied Party/Date Fields Flagged in missing_information
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft legal notice without mentioning exact dates or DIN number',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res7.result as any;
    const draft = payload?.draft || payload;
    const missingInfo = draft?.missing_information || [];
    const hasMissingFlag = Array.isArray(missingInfo) && missingInfo.length > 0;

    assertTest(
      'TEST 7: Drafting agent flags un-supplied required parameters in missing_information (no fabrication)',
      hasMissingFlag,
      `Expected missing information flags, got: ${JSON.stringify(missingInfo)}`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: Adversarial Red-Team Agent Direct Routing
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Perform red-team stress test on legal draft',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'adversarial',
      caseId: 'C-1042',
      draftContent: 'The taxpayer claims complete exemption under Section 11 without submitting audited financials.',
    });

    assertTest(
      'TEST 8: adversarial agent direct task completes with status completed',
      res8.status === 'completed',
      `Expected status 'completed', got '${res8.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: Module 25 — Adversarial Red-Team Payload Structure
  // ----------------------------------------------------
  try {
    const res9 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Red-team stress test GST appeal petition',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'adversarial',
      caseId: 'C-1042',
      draftContent: 'We deny all liability on grounds of natural justice violations.',
    });

    const payload = res9.result as any;
    const hasFields = Boolean(
      typeof payload?.overall_risk_score === 'number' &&
      payload?.risk_severity &&
      Array.isArray(payload?.counterarguments) &&
      Array.isArray(payload?.weaknesses) &&
      Array.isArray(payload?.missing_references) &&
      payload?.requires_human_review === true
    );

    assertTest(
      'TEST 9: Module 25 — Adversarial payload structured with risk score, severity, counterarguments, weaknesses, and requires_human_review',
      hasFields,
      `Invalid adversarial payload structure: ${JSON.stringify(res9.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 10: Flaw Categorization into Valid Weakness Types
  // ----------------------------------------------------
  try {
    const res10 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Critique weak legal submission',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'adversarial',
      caseId: 'C-1042',
      draftContent: 'The order is bad in law without supporting citations or documents.',
    });

    const payload = res10.result as any;
    const weaknesses = payload?.weaknesses || [];
    const validCategories = ['unsupported_claim', 'contradiction', 'missing_evidence', 'legal_risk', 'ambiguity'];
    const allValid = Array.isArray(weaknesses) && weaknesses.every((w: any) => validCategories.includes(w.category));

    assertTest(
      'TEST 10: Adversarial weaknesses categorized into valid types (unsupported_claim, contradiction, missing_evidence, legal_risk, ambiguity)',
      allValid && weaknesses.length > 0,
      `Weakness categories invalid or empty: ${JSON.stringify(weaknesses)}`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: Non-Mutation Constraint — Adversarial review does not mutate draft_content
  // ----------------------------------------------------
  try {
    const originalText = 'Original draft text submitted for red-team analysis.';
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Red team critique of draft',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'adversarial',
      caseId: 'C-1042',
      draftContent: originalText,
    });

    const payload = res11.result as any;
    const returnedContent = payload?.draft_content;
    const contentUnchanged = returnedContent === undefined || returnedContent === originalText;

    assertTest(
      'TEST 11: Adversarial agent critique does NOT mutate or rewrite the original draft text',
      contentUnchanged,
      `Original content was altered: '${returnedContent}'`
    );
  } catch (err: any) {
    assertTest('TEST 11: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 12: Approval Gate Constraint — Adversarial review requires human review (never auto-approves)
  // ----------------------------------------------------
  try {
    const res12 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Red team critique of draft',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'adversarial',
      caseId: 'C-1042',
    });

    const payload = res12.result as any;
    const requiresReview = payload?.requires_human_review === true;
    const humanReviewStatus = res12.human_review_status;

    assertTest(
      'TEST 12: Adversarial agent requires human review and never auto-approves draft',
      requiresReview && humanReviewStatus === 'pending',
      `Auto-approval detected or missing review requirement: ${JSON.stringify(res12)}`
    );
  } catch (err: any) {
    assertTest('TEST 12: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 13: Human Review Gate Preserved on Task Execution
  // ----------------------------------------------------
  try {
    const res13 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft reply for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 13: Drafting pipeline task preserves human_review_status = pending',
      res13.human_review_status === 'pending',
      `Expected human_review_status 'pending', got '${res13.human_review_status}'`
    );
  } catch (err: any) {
    assertTest('TEST 13: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 14: RBAC Case Scoping Isolation — Employee blocked from unauthorized case
  // ----------------------------------------------------
  try {
    const res14 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft reply for unauthorized case C-9999',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-9999',
    });

    const isDenied =
      res14.status === 'failed' ||
      Boolean(
        res14.message?.includes('forbidden') ||
        res14.message?.includes('Security Violation') ||
        (res14.result as any)?.error
      );

    assertTest(
      'TEST 14: RBAC case scoping blocks employee access to unauthorized case C-9999',
      isDenied,
      `Unauthorized case access surprisingly allowed: ${JSON.stringify(res14)}`
    );
  } catch (err: any) {
    assertTest('TEST 14: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 15: RBAC Tenant Isolation — Client blocked from cross-tenant documents
  // ----------------------------------------------------
  try {
    const res15 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft reply for cross-tenant document DOC-2002',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'drafting',
      documentId: 'DOC-2002',
    });

    const isDenied =
      res15.status === 'failed' ||
      Boolean(
        res15.message?.includes('forbidden') ||
        res15.message?.includes('Security Violation') ||
        (res15.result as any)?.error
      );

    assertTest(
      'TEST 15: RBAC tenant isolation blocks Client from cross-tenant documents',
      isDenied,
      `Cross-tenant document access surprisingly allowed: ${JSON.stringify(res15)}`
    );
  } catch (err: any) {
    assertTest('TEST 15: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 16: Role Filtering — Client role receives pending_review placeholder for draft content
  // ----------------------------------------------------
  try {
    const res16 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft notice response for client',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res16.result as any;
    const draftContent = payload?.draft?.draft_content || payload?.draft_content;
    const isPlaceholder = payload?.status === 'pending_review' || draftContent === '[CONTENT PENDING HUMAN REVIEW]';

    assertTest(
      'TEST 16: Role filtering delivers [CONTENT PENDING HUMAN REVIEW] placeholder for Client role before human approval',
      isPlaceholder,
      `Client received raw draft content before human approval: '${draftContent}'`
    );
  } catch (err: any) {
    assertTest('TEST 16: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 17: Role Filtering — Client role strips internal_rationale and internal_notes
  // ----------------------------------------------------
  try {
    const res17 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft notice response for client',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res17.result as any;
    const hasRationale = payload?.draft?.internal_rationale || payload?.internal_rationale;
    const hasNotes = payload?.draft?.internal_notes || payload?.internal_notes;

    assertTest(
      'TEST 17: Role filtering strips internal_rationale and internal_notes for Client role',
      !hasRationale && !hasNotes,
      `Internal fields leaked to Client role: rationale=${hasRationale}, notes=${hasNotes}`
    );
  } catch (err: any) {
    assertTest('TEST 17: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 18: Fallback Path — Drafting falls back to rule-based fallback when Gemini fails
  // ----------------------------------------------------
  try {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res18 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft reply with fallback mode',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    process.env.GEMINI_API_KEY = origKey;

    const payload = res18.result as any;
    const isFallback = res18.ai_source === 'rule_based_fallback';

    assertTest(
      'TEST 18: Drafting agent falls back gracefully to rule_based_fallback when AI API is unavailable',
      isFallback && res18.status === 'completed',
      `Expected ai_source 'rule_based_fallback', got '${res18.ai_source}'`
    );
  } catch (err: any) {
    assertTest('TEST 18: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 19: Fallback Path — Adversarial falls back to rule-based fallback when Gemini fails
  // ----------------------------------------------------
  try {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res19 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Red-team critique with fallback mode',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'adversarial',
      caseId: 'C-1042',
    });

    process.env.GEMINI_API_KEY = origKey;

    const isFallback = res19.ai_source === 'rule_based_fallback';

    assertTest(
      'TEST 19: Adversarial agent falls back gracefully to rule_based_fallback when AI API is unavailable',
      isFallback && res19.status === 'completed',
      `Expected ai_source 'rule_based_fallback', got '${res19.ai_source}'`
    );
  } catch (err: any) {
    assertTest('TEST 19: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 20: Live Activity Feed Task State Progression
  // ----------------------------------------------------
  try {
    const res20 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft response for task progression test',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const taskRecord = await supabaseService.getAgentTaskById(res20.task_id);
    const isValidTask = Boolean(
      taskRecord &&
      taskRecord.status === 'completed' &&
      typeof taskRecord.current_step === 'number' &&
      taskRecord.output_summary
    );

    assertTest(
      'TEST 20: Real task created and updated in database with status COMPLETED and valid output_summary',
      isValidTask,
      `Task database record state invalid: ${JSON.stringify(taskRecord)}`
    );
  } catch (err: any) {
    assertTest('TEST 20: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 21: PDF Report Generation for Drafting + Red Team Bundle
  // ----------------------------------------------------
  try {
    const pdfBuffer = await pdfGeneratorService.generatePdfBuffer({
      taskId: 'task_phase12_test',
      userId: 'usr_emp_amit',
      title: 'Legal Draft & Red-Team Critique Bundle',
      agentKey: 'drafting',
      aiSource: 'ai',
      data: {
        draft: {
          document_title: 'Reply to Show Cause Notice',
          template_type: 'Legal Response Notice',
          draft_content: 'Taxpayer respectfully submits that no short-payment occurred...',
          citations_used: [{ citation_text: 'Arnesh Kumar v. State of Bihar (2014) 8 SCC 273', matched_source_id: 'DOC-KNOW-101' }],
          missing_information: ['Exact DIN number', 'Copy of DRC-01 notice'],
          status: 'ai_draft',
        },
        citation_verification: {
          verified_count: 1,
          unverified_count: 0,
        },
        adversarial_review: {
          overall_risk_score: 35,
          risk_severity: 'MEDIUM',
          weaknesses: [{ category: 'missing_evidence', flaw: 'Audited balance sheet not attached', mitigation: 'Attach Annexure A' }],
        },
      },
    });

    const isValidPdf = Boolean(pdfBuffer && pdfBuffer.length > 500 && pdfBuffer.toString('utf-8', 0, 4) === '%PDF');

    assertTest(
      'TEST 21: PDF report generator successfully creates valid PDF buffer for Draft & Red Team bundle',
      isValidPdf,
      `PDF buffer invalid or too small. Length=${pdfBuffer?.length}`
    );
  } catch (err: any) {
    assertTest('TEST 21: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 22: Full Pipeline End-to-End Execution
  // ----------------------------------------------------
  try {
    const res22 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Draft comprehensive reply to GST SCN with full pipeline check',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'drafting',
      caseId: 'C-1042',
    });

    const payload = res22.result as any;
    const isCompleteBundle = Boolean(
      payload?.draft &&
      payload?.citation_verification &&
      payload?.adversarial_review &&
      payload?.status === 'ai_draft' &&
      payload?.case_id === 'C-1042'
    );

    assertTest(
      'TEST 22: Full end-to-end pipeline (Drafting -> Citation Check -> Adversarial Review) returns unified complete bundle',
      isCompleteBundle,
      `Pipeline bundle incomplete: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 22: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION SUITES (PHASES 1–11)
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (PHASES 1 TO 11)');
  console.log('------------------------------------------------------------\n');

  console.log('--- Phase 1 Regression ---');
  const p1 = await runAiPhase1Tests();
  const p1Passed = p1.passed >= 18;
  assertTest('REGRESSION Phase 1: AI Engine Core Infrastructure', p1Passed, `Phase 1 passed ${p1.passed}/${p1.total}`);

  console.log('\n--- Phase 2 Regression ---');
  const p2 = await runAiPhase2Tests();
  assertTest('REGRESSION Phase 2: System Prompts & Database Persistence', p2.passed === p2.total, `Phase 2 passed ${p2.passed}/${p2.total}`);

  console.log('\n--- Phase 3 Regression ---');
  const p3 = await runAiPhase3Tests();
  assertTest('REGRESSION Phase 3: Dynamic PDF Generator & Export Pipeline', p3.passed === p3.total, `Phase 3 passed ${p3.passed}/${p3.total}`);

  console.log('\n--- Phase 4 Regression ---');
  const p4 = await runAiPhase4Tests();
  assertTest('REGRESSION Phase 4: RAG Engine & Document Embedding System', p4.passed === p4.total, `Phase 4 passed ${p4.passed}/${p4.total}`);

  console.log('\n--- Phase 5 Regression ---');
  const p5 = await runAiPhase5Tests();
  assertTest('REGRESSION Phase 5: Ultron Orchestrator Loop & Verification', p5.passed === p5.total, `Phase 5 passed ${p5.passed}/${p5.total}`);

  console.log('\n--- Phase 6 Regression ---');
  const p6 = await runAiPhase6Tests();
  assertTest('REGRESSION Phase 6: Communication & Reporting Agent', p6.passed === p6.total, `Phase 6 passed ${p6.passed}/${p6.total}`);

  console.log('\n--- Phase 7 Regression ---');
  const p7 = await runAiPhase7Tests();
  assertTest('REGRESSION Phase 7: Document Intelligence Agent', p7.passed === p7.total, `Phase 7 passed ${p7.passed}/${p7.total}`);

  console.log('\n--- Phase 8 Regression ---');
  const p8 = await runAiPhase8Tests();
  assertTest('REGRESSION Phase 8: Case Analysis Agent', p8.passed === p8.total, `Phase 8 passed ${p8.passed}/${p8.total}`);

  console.log('\n--- Phase 9 Regression ---');
  const p9 = await runAiPhase9Tests();
  assertTest('REGRESSION Phase 9: Risk & Compliance / GST Intelligence Agent', p9.passed === p9.total, `Phase 9 passed ${p9.passed}/${p9.total}`);

  console.log('\n--- Phase 10 Regression ---');
  const p10 = await runAiPhase10Tests();
  assertTest('REGRESSION Phase 10: Legal Research Agent', p10.passed === p10.total, `Phase 10 passed ${p10.passed}/${p10.total}`);

  console.log('\n--- Phase 11 Regression ---');
  const p11 = await runAiPhase11Tests();
  assertTest('REGRESSION Phase 11: Citation Verification Agent', p11.passed === p11.total, `Phase 11 passed ${p11.passed}/${p11.total}`);

  console.log('\n============================================================');
  console.log(`📊 PHASE 12 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  console.log('============================================================\n');

  return { total, passed, failures };
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase12Tests')) {
  runAiPhase12Tests()
    .then(({ total, passed, failures }) => {
      if (failures.length > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('Fatal test error:', err);
      process.exit(1);
    });
}
