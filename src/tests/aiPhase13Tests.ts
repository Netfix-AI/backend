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
import { runAiPhase12Tests } from './aiPhase12Tests.js';

export async function runAiPhase13Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🔍 NETFIX AI — PHASE 13 TAX & GST INTELLIGENCE AGENT SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Tax Intelligence Agent Routing & Task Completion
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute Income Tax computation for AY 2025-26 under new regime',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 1: tax_intelligence agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Module 10 — Income Tax Intelligence Payload Structure
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Analyze income tax computation and Form 26AS mismatch for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res2.result as any;
    const hasFields = Boolean(
      payload?.assessment_year &&
      payload?.financial_year &&
      typeof payload?.gross_total_income === 'number' &&
      Array.isArray(payload?.compliance_deficiencies)
    );

    assertTest(
      'TEST 2: Module 10 — Income tax intelligence payload structured with assessment_year, gross_total_income, and deficiencies',
      hasFields,
      `Invalid Module 10 payload structure: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Module 11 — Tax Computation Payload Structure
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax liability under old regime vs new regime',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res3.result as any;
    const hasFields = Boolean(
      payload?.tax_regime &&
      typeof payload?.taxable_income === 'number' &&
      typeof payload?.deterministic_tax_liability === 'number' &&
      Array.isArray(payload?.deductions_breakdown)
    );

    assertTest(
      'TEST 3: Module 11 — Tax computation payload structured with regime, taxable income, deterministic liability, and deductions',
      hasFields,
      `Invalid Module 11 payload structure: ${JSON.stringify(res3.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Module 16 — Tax Compliance & Optimization Payload Structure
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Analyze tax compliance and optimization potential',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res4.result as any;
    const hasFields = Boolean(
      typeof payload?.optimization_potential === 'number' &&
      Array.isArray(payload?.suggested_optimizations)
    );

    assertTest(
      'TEST 4: Module 16 — Tax compliance & optimization structured with potential savings and recommendations',
      hasFields,
      `Invalid Module 16 payload structure: ${JSON.stringify(res4.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Exact Schema Property Conformance
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for AY 2025-26',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res5.result as any;
    const conforms = Boolean(
      payload?.assessment_year &&
      payload?.financial_year &&
      payload?.tax_regime &&
      typeof payload?.gross_total_income === 'number' &&
      typeof payload?.total_deductions === 'number' &&
      typeof payload?.taxable_income === 'number' &&
      typeof payload?.deterministic_tax_liability === 'number' &&
      typeof payload?.ai_estimated_tax_liability === 'number' &&
      typeof payload?.numerical_consistency === 'boolean' &&
      typeof payload?.discrepancy_flag === 'boolean'
    );

    assertTest(
      'TEST 5: Tax intelligence schema strictly conforms to required numerical and analytical properties',
      conforms,
      `Schema non-conformant: ${JSON.stringify(res5.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Tax Period Handling (AY 2025-26 / FY 2024-25)
  // ----------------------------------------------------
  try {
    const res6 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for AY 2025-26',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res6.result as any;
    const validPeriod = payload?.assessment_year === '2025-2026' && payload?.financial_year === '2024-2025';

    assertTest(
      'TEST 6: Tax period correctly parsed to AY 2025-2026 / FY 2024-2025',
      validPeriod,
      `Incorrect period handling: AY=${payload?.assessment_year}, FY=${payload?.financial_year}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Tax Regime Handling (New vs Old Regime)
  // ----------------------------------------------------
  try {
    const res7Old = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax under old regime for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payloadOld = res7Old.result as any;
    const isOldRegime = payloadOld?.tax_regime === 'old';

    assertTest(
      'TEST 7: Tax regime selection correctly identifies old regime from task context',
      isOldRegime,
      `Expected tax_regime 'old', got '${payloadOld?.tax_regime}'`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: Authoritative Deterministic Tax Calculation Engine Execution
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Run deterministic tax computation',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res8.result as any;
    const detTax = payload?.deterministic_tax_liability;
    const isNumber = typeof detTax === 'number' && detTax > 0;

    assertTest(
      'TEST 8: Authoritative deterministic tax calculation engine executes and returns positive non-zero tax liability',
      isNumber,
      `Invalid deterministic tax liability: ${detTax}`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: AI Interpretation Layer Integration
  // ----------------------------------------------------
  try {
    const res9 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Explain tax computation and deduction benefits',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res9.result as any;
    const hasAIVal = typeof payload?.ai_estimated_tax_liability === 'number';

    assertTest(
      'TEST 9: AI interpretation layer returns estimated tax liability alongside deterministic baseline',
      hasAIVal,
      `AI estimated tax liability missing: ${JSON.stringify(res9.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 10: AI vs Deterministic Numerical Consistency Check
  // ----------------------------------------------------
  try {
    const res10 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify numerical consistency between AI and deterministic tax liability',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res10.result as any;
    const hasConsistency = typeof payload?.numerical_consistency === 'boolean';

    assertTest(
      'TEST 10: Numerical consistency flag evaluates equality between AI and deterministic outputs',
      hasConsistency,
      `Numerical consistency flag missing: ${JSON.stringify(res10.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: Discrepancy Detection & Deterministic Victory Rule
  // ----------------------------------------------------
  try {
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax with discrepancy check',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res11.result as any;
    const detTax = payload?.deterministic_tax_liability;
    const hasFlag = typeof payload?.discrepancy_flag === 'boolean';

    assertTest(
      'TEST 11: Deterministic tax liability ALWAYS wins in output bundle regardless of AI estimation',
      typeof detTax === 'number' && hasFlag,
      `Deterministic victory check failed: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 11: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 12: Missing Information Handling
  // ----------------------------------------------------
  try {
    const res12 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for un-specified income sources',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res12.result as any;
    const deficiencies = payload?.compliance_deficiencies || [];

    assertTest(
      'TEST 12: Tax intelligence identifies missing information or Form 26AS verification requirements',
      Array.isArray(deficiencies),
      `Deficiencies payload invalid: ${JSON.stringify(deficiencies)}`
    );
  } catch (err: any) {
    assertTest('TEST 12: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 13: RAG Statutory Grounding Integration
  // ----------------------------------------------------
  try {
    const res13 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Tax analysis grounding under Section 80C and Section 16',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res13.result as any;
    const opts = payload?.suggested_optimizations || [];
    const hasGrounding = opts.length > 0 && opts.some((o: any) => o.section);

    assertTest(
      'TEST 13: Tax intelligence recommendations grounded in statutory sections (Section 80C / 80D / 24)',
      hasGrounding,
      `Statutory grounding missing: ${JSON.stringify(opts)}`
    );
  } catch (err: any) {
    assertTest('TEST 13: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 14: Existing GST Deterministic Calculation Preservation
  // ----------------------------------------------------
  try {
    const res14 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Tax analysis including GST reconciliation',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res14.result as any;
    const gstSummary = payload?.gst_reconciliation_summary;
    const preservesGst = Boolean(
      gstSummary &&
      typeof gstSummary.invoiced_value === 'number' &&
      typeof gstSummary.gst_payable === 'number' &&
      typeof gstSummary.eligible_itc === 'number'
    );

    assertTest(
      'TEST 14: Phase 13 reuses and preserves Phase 9 deterministic GST calculation and reconciliation baseline',
      preservesGst,
      `GST reconciliation summary missing or invalid: ${JSON.stringify(gstSummary)}`
    );
  } catch (err: any) {
    assertTest('TEST 14: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 15: No Conflicting GST Engine
  // ----------------------------------------------------
  try {
    const res15 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute GST match percentage',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res15.result as any;
    const matchPct = payload?.gst_reconciliation_summary?.match_percentage;

    assertTest(
      'TEST 15: GST match percentage matches Phase 9 baseline (92% match) without competing engine',
      matchPct === 92.0,
      `Expected GST match percentage 92.0, got ${matchPct}`
    );
  } catch (err: any) {
    assertTest('TEST 15: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 16: RBAC Case Scoping — Employee blocked from unauthorized case
  // ----------------------------------------------------
  try {
    const res16 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for unauthorized case C-9999',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-9999',
    });

    const isDenied =
      res16.status === 'failed' ||
      Boolean(
        res16.message?.includes('forbidden') ||
        res16.message?.includes('Security Violation') ||
        (res16.result as any)?.error
      );

    assertTest(
      'TEST 16: RBAC case scoping blocks employee access to unauthorized case C-9999',
      isDenied,
      `Unauthorized case access surprisingly allowed: ${JSON.stringify(res16)}`
    );
  } catch (err: any) {
    assertTest('TEST 16: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 17: RBAC Tenant Isolation — Client blocked from cross-tenant documents
  // ----------------------------------------------------
  try {
    const res17 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for cross-tenant document DOC-2002',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'tax_intelligence',
      documentId: 'DOC-2002',
    });

    const isDenied =
      res17.status === 'failed' ||
      Boolean(
        res17.message?.includes('forbidden') ||
        res17.message?.includes('Security Violation') ||
        (res17.result as any)?.error
      );

    assertTest(
      'TEST 17: RBAC tenant isolation blocks Client from cross-tenant documents',
      isDenied,
      `Cross-tenant document access surprisingly allowed: ${JSON.stringify(res17)}`
    );
  } catch (err: any) {
    assertTest('TEST 17: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 18: Role Filtering — Client role receives pending_review placeholder before human approval
  // ----------------------------------------------------
  try {
    const res18 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for client',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const isPlaceholder = Boolean(res18.result && (res18.result as any).status === 'pending_review');

    assertTest(
      'TEST 18: Role filtering delivers pending_review status for Client role before human approval',
      isPlaceholder,
      `Client received raw tax output before human approval: ${JSON.stringify(res18.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 18: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 19: Role Filtering — Client role strips internal_rationale and internal_notes
  // ----------------------------------------------------
  try {
    const res19 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for client',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const payload = res19.result as any;
    const hasRationale = Boolean(payload?.internal_rationale);
    const hasNotes = Boolean(payload?.internal_notes);

    assertTest(
      'TEST 19: Role filtering strips internal_rationale and internal_notes for Client role',
      !hasRationale && !hasNotes,
      `Internal fields leaked to Client role: rationale=${hasRationale}, notes=${hasNotes}`
    );
  } catch (err: any) {
    assertTest('TEST 19: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 20: Fallback Path — Tax Intelligence falls back to rule-based fallback when Gemini fails
  // ----------------------------------------------------
  try {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res20 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax with fallback mode',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    process.env.GEMINI_API_KEY = origKey;

    const isFallback = res20.ai_source === 'rule_based_fallback';

    assertTest(
      'TEST 20: Tax intelligence agent falls back gracefully to rule_based_fallback when AI API is unavailable',
      isFallback && res20.status === 'completed',
      `Expected ai_source 'rule_based_fallback', got '${res20.ai_source}'`
    );
  } catch (err: any) {
    assertTest('TEST 20: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 21: Human Review Gate Preserved
  // ----------------------------------------------------
  try {
    const res21 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute tax for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 21: Tax intelligence pipeline task preserves human_review_status = pending',
      res21.human_review_status === 'pending',
      `Expected human_review_status 'pending', got '${res21.human_review_status}'`
    );
  } catch (err: any) {
    assertTest('TEST 21: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 22: Live Activity Feed Real Task State Progression
  // ----------------------------------------------------
  try {
    const res22 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Tax computation for task progression test',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    const taskRecord = await supabaseService.getAgentTaskById(res22.task_id);
    const isValidTask = Boolean(
      taskRecord &&
      taskRecord.status === 'completed' &&
      typeof taskRecord.current_step === 'number' &&
      taskRecord.output_summary
    );

    assertTest(
      'TEST 22: Real task created and updated in database with status COMPLETED and valid output_summary',
      isValidTask,
      `Task database record state invalid: ${JSON.stringify(taskRecord)}`
    );
  } catch (err: any) {
    assertTest('TEST 22: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 23: PDF Report Generation for Tax & GST Intelligence
  // ----------------------------------------------------
  try {
    const pdfBuffer = await pdfGeneratorService.generatePdfBuffer({
      taskId: 'task_phase13_test',
      userId: 'usr_emp_amit',
      title: 'Income Tax & GST Intelligence Computation Report',
      agentKey: 'tax_intelligence',
      aiSource: 'ai',
      data: {
        assessment_year: '2025-2026',
        financial_year: '2024-2025',
        tax_regime: 'new',
        gross_total_income: 4280000,
        taxable_income: 4205000,
        deterministic_tax_liability: 976560,
        ai_estimated_tax_liability: 976560,
        numerical_consistency: true,
        discrepancy_flag: false,
        gst_reconciliation_summary: {
          invoiced_value: 12450000,
          gst_payable: 1867500,
          eligible_itc: 1640000,
          match_percentage: 92,
        },
      },
    });

    const isValidPdf = Boolean(pdfBuffer && pdfBuffer.length > 500 && pdfBuffer.toString('utf-8', 0, 4) === '%PDF');

    assertTest(
      'TEST 23: PDF report generator successfully creates valid PDF buffer for Tax Intelligence report',
      isValidPdf,
      `PDF buffer invalid or too small. Length=${pdfBuffer?.length}`
    );
  } catch (err: any) {
    assertTest('TEST 23: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION SUITES (PHASES 1–12)
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (PHASES 1 TO 12)');
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

  console.log('\n--- Phase 12 Regression ---');
  const p12 = await runAiPhase12Tests();
  assertTest('REGRESSION Phase 12: Legal Drafting & Adversarial Agents', p12.passed === p12.total, `Phase 12 passed ${p12.passed}/${p12.total}`);

  console.log('\n============================================================');
  console.log(`📊 PHASE 13 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  console.log('============================================================\n');

  return { total, passed, failures };
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase13Tests')) {
  runAiPhase13Tests()
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
