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

export async function runAiPhase8Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('⚖️ NETFIX AI — PHASE 8 CASE ANALYSIS AGENT TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Case Analysis Agent Routing & Task Completion
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Analyze case facts, issues, and synthesis for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 1: case_analysis agent task completes with status completed',
      res1.status === 'completed',
      `Expected status 'completed', got '${res1.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: Module 20 — Case Fact Engine Extraction
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Extract structured facts for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    const payload = res2.result as any;
    const facts = payload?.case_facts || [];
    const hasFacts = Array.isArray(facts) && facts.length > 0;
    const validFactFields = facts.every((f: any) => Boolean(f.fact_text && f.fact_type && f.status && typeof f.confidence_score === 'number'));

    assertTest(
      'TEST 2: Module 20 — Case facts extracted with fact_text, status, and confidence scores',
      hasFacts && validFactFields,
      `Invalid case facts in payload: ${JSON.stringify(res2.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Module 21 — Case / Issue Analysis
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Analyze legal & tax issues for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    const payload = res3.result as any;
    const issues = payload?.issues_analysis || [];
    const hasIssues = Array.isArray(issues) && issues.length > 0;
    const validIssueFields = issues.every((i: any) => Boolean(i.issue_title && i.analysis_narrative && typeof i.confidence_score === 'number'));

    assertTest(
      'TEST 3: Module 21 — Issue analysis extracted with title, narrative, rules, and confidence',
      hasIssues && validIssueFields,
      `Invalid issues analysis in payload: ${JSON.stringify(res3.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Module 23 — Case Intelligence & Synthesis
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Synthesize case intelligence and next steps for C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    const payload = res4.result as any;
    const synthesis = payload?.case_synthesis;
    const hasSynthesis = Boolean(synthesis?.overall_summary && synthesis?.risk_level && Array.isArray(synthesis?.recommended_next_steps));

    assertTest(
      'TEST 4: Module 23 — Case synthesis generated with overall summary, risk level, and next steps',
      hasSynthesis,
      `Invalid case synthesis in payload: ${JSON.stringify(res4.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Contradictions & Missing Information Arrays
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Identify missing info and contradictions for C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    const payload = res5.result as any;
    const hasContradictionsArray = Array.isArray(payload?.contradictions);
    const hasMissingInfoArray = Array.isArray(payload?.missing_information);

    assertTest(
      'TEST 5: Contradictions and missing_information arrays present in schema',
      hasContradictionsArray && hasMissingInfoArray,
      `Contradictions or missing_information array missing: ${JSON.stringify(res5.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Deterministic Fallback Engine under Simulated 429 / Rate Limit
  // ----------------------------------------------------
  try {
    const origCall = geminiService.call.bind(geminiService);
    (geminiService as any).call = async () => ({ ai_source: 'rule_based_fallback' });

    const fallbackRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Analyze case C-1042 under simulated Gemini rate limit',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    (geminiService as any).call = origCall;

    assertTest(
      'TEST 6: Rate limit simulation triggers rule-based fallback with ai_source = rule_based_fallback',
      fallbackRes.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${fallbackRes.ai_source}'`
    );

    const payload = fallbackRes.result as any;
    assertTest(
      'TEST 6: Fallback engine extracts structured facts, issues, and synthesis',
      Boolean(payload?.case_facts?.length > 0 && payload?.issues_analysis?.length > 0 && payload?.case_synthesis?.overall_summary),
      `Unexpected fallback case analysis output: ${JSON.stringify(fallbackRes.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Explicit Case Scoping (Case A supplied -> Case B excluded)
  // ----------------------------------------------------
  try {
    const contextBundle = await ultronOrchestrator.buildContextBundle(
      'usr_emp_amit',
      'Analyze explicitly supplied case C-1042 only',
      'TASK-TEST-CASE-SCOPE',
      undefined,
      'C-1042',
      'case_analysis'
    );

    const caseIdsInContext = contextBundle.cases.map((c: any) => c.id);
    const containsCase1042 = caseIdsInContext.includes('C-1042');
    const excludesCase1039 = !caseIdsInContext.includes('C-1039');

    assertTest(
      'TEST 7: Case Scoping — Context bundle contains ONLY requested case C-1042 and excludes C-1039',
      containsCase1042 && excludesCase1039 && caseIdsInContext.length === 1,
      `Case scoping failure: context cases were [${caseIdsInContext.join(', ')}]`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: RBAC Unauthorized Case Access Rejection
  // ----------------------------------------------------
  try {
    let rbacErrorCaught = false;

    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Attempt access to unauthorized case C-1042 by Client B',
      requestingUserId: 'usr_cli_sharma_b', // Client for Sharma Enterprises trying to access C-1042 (ABC Pvt Ltd)
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    if (res8.status === 'failed' && (res8.message?.includes('Security Violation') || res8.message?.includes('forbidden'))) {
      rbacErrorCaught = true;
    }

    assertTest(
      'TEST 8: RBAC — Cross-client/tenant case access rejected before AI call',
      rbacErrorCaught,
      `Security Leak: Unauthorized case access was NOT rejected by RBAC! Got result: ${JSON.stringify(res8)}`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: Human-Review Gate & Client Role Isolation
  // ----------------------------------------------------
  try {
    const res9Client = await ultronOrchestrator.orchestrate({
      taskDescription: 'Request case analysis summary as client',
      requestingUserId: 'usr_cli_rajesh',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 9: Human Review Gate — case_analysis triggers human_review_status = pending',
      res9Client.human_review_status === 'pending',
      `Expected human_review_status 'pending', got '${res9Client.human_review_status}'`
    );

    const isPendingPlaceholder = (res9Client.result as any)?.status === 'pending_review';
    assertTest(
      'TEST 9: Client Role Isolation — Client receives pending_review placeholder while held for human review',
      isPendingPlaceholder,
      `Client role did not receive pending_review placeholder: ${JSON.stringify(res9Client.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 10: Role-Based Filtering of Internal Notes/Rationale for Employees vs Clients
  // ----------------------------------------------------
  try {
    const resEmp = await ultronOrchestrator.orchestrate({
      taskDescription: 'Execute case analysis as assigned employee',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    const payloadEmp = resEmp.result as any;
    const hasInternalNotes = Boolean(payloadEmp?.case_synthesis?.internal_notes);
    const hasInternalRationale = Boolean(payloadEmp?.case_synthesis?.internal_rationale);

    assertTest(
      'TEST 10: Employee role receives internal_notes and internal_rationale in case synthesis',
      hasInternalNotes && hasInternalRationale,
      `internal_notes or internal_rationale missing for employee role: ${JSON.stringify(resEmp.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: End-to-End Ultron Integration & PDF Report Generation
  // ----------------------------------------------------
  try {
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Run full Ultron loop for case_analysis with downloadable PDF',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 11: Ultron Integration — case_analysis task produces downloadable PDF report',
      Boolean(res11.pdf_report && res11.pdf_report.download_url.includes('/api/agent/reports/download/')),
      `Downloadable PDF report missing: ${JSON.stringify(res11.pdf_report)}`
    );
  } catch (err: any) {
    assertTest('TEST 11: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 12: Live Task State Updates (Step-Writer)
  // ----------------------------------------------------
  try {
    const res12 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify live task step tracking for case_analysis',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'case_analysis',
      caseId: 'C-1042',
    });

    const taskEntity = await supabaseService.getAgentTaskById(res12.task_id);

    assertTest(
      'TEST 12: Live Task State — task logged in agent_tasks table with current_step > 0',
      Boolean(taskEntity && (taskEntity.current_step || 0) > 0),
      `Task step state missing or step is 0: ${JSON.stringify(taskEntity)}`
    );
  } catch (err: any) {
    assertTest('TEST 12: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS: Run Phases 1, 2, 3, 4, 5, 6, & 7
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1, 2, 3, 4, 5, 6, & 7)');
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

  const p7Res = await runAiPhase7Tests();
  assertTest('REGRESSION: Phase 7 Test Suite Passed', p7Res.passed === 17, `Phase 7 failed: ${p7Res.failures.join(', ')}`);

  console.log('\n============================================================');
  console.log(`📊 PHASE 8 TEST SUMMARY: ${passed}/${total} PASSED`);
  console.log('============================================================\n');

  return { total, passed, failures };
}

// Standalone execution if run directly via tsx
if (process.argv[1]?.includes('aiPhase8Tests')) {
  runAiPhase8Tests()
    .then(({ total, passed, failures }) => {
      if (failures.length > 0) {
        console.error(`❌ Phase 8 Tests Completed with ${failures.length} Failure(s)`);
        process.exit(1);
      } else {
        console.log(`✅ Phase 8 Tests Completed Successfully (${passed}/${total} PASS)`);
        process.exit(0);
      }
    })
    .catch(err => {
      console.error('Fatal Error running Phase 8 test suite:', err);
      process.exit(1);
    });
}
