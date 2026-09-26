import fs from 'fs';
import { pdfGeneratorService } from '../services/pdfGeneratorService.js';
import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { supabaseService } from '../services/supabaseService.js';
import { runAiPhase1Tests } from './aiPhase1Tests.js';
import { runAiPhase2Tests } from './aiPhase2Tests.js';

export async function runAiPhase3Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('📄 NETFIX AI — PHASE 3 PDF OUTPUT ENGINE TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: PDF Buffer Generation (%PDF header check)
  // ----------------------------------------------------
  try {
    const pdfBuf = await pdfGeneratorService.generatePdfBuffer({
      taskId: 'TASK-P3-TEST-001',
      userId: 'usr_demo_emp',
      title: 'PDF Engine Render Test',
      agentKey: 'dummy',
      aiSource: 'ai',
      data: { summary: 'PDF generation test summary data', score: 98 },
    });

    const isBufferValid = Buffer.isBuffer(pdfBuf) && pdfBuf.length > 500;
    const isPdfHeader = pdfBuf.toString('utf8', 0, 4) === '%PDF';

    assertTest(
      'TEST 1: generatePdfBuffer produces valid non-empty Buffer',
      isBufferValid,
      `Buffer invalid or length too small (${pdfBuf ? pdfBuf.length : 0} bytes)`
    );
    assertTest(
      'TEST 2: Generated PDF buffer starts with %PDF header signature',
      isPdfHeader,
      `Expected header '%PDF', got '${pdfBuf.toString('utf8', 0, 4)}'`
    );
  } catch (err: any) {
    assertTest('TEST 1 & 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Report Storage & generated_reports Table DB Entry
  // ----------------------------------------------------
  try {
    const report = await pdfGeneratorService.generateAndStoreReport({
      taskId: 'TASK-P3-TEST-002',
      userId: 'usr_demo_cli',
      title: 'Report Storage Integration Test',
      agentKey: 'tax_intelligence',
      aiSource: 'ai',
      data: { result: 'GST computation payload' },
    });

    assertTest(
      'TEST 3: generateAndStoreReport returns valid report ID',
      Boolean(report && report.id.startsWith('rep_')),
      `Expected report id starting with 'rep_', got '${report ? report.id : null}'`
    );
    assertTest(
      'TEST 4: Report file created on disk at file_path',
      fs.existsSync(report.file_path),
      `File path '${report.file_path}' does not exist on disk`
    );

    const dbRecord = await supabaseService.getGeneratedReportById(report.id);
    assertTest(
      'TEST 5: Report metadata retrieved from database/storage store',
      Boolean(dbRecord && dbRecord.id === report.id),
      'Database record for generated report not found'
    );
  } catch (err: any) {
    assertTest('TEST 3-5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: Phase 2 Dummy Task End-to-End PDF Integration
  // ----------------------------------------------------
  try {
    const orchestrateRes = await ultronOrchestrator.orchestrate({
      taskDescription: 'Execute dummy task with PDF generation',
      requestingUserId: 'usr_demo_cli',
      agentKey: 'dummy',
    });

    assertTest(
      'TEST 6: Phase 2 task completion returns pdf_report object',
      Boolean(orchestrateRes.pdf_report),
      'orchestrateRes.pdf_report is missing'
    );
    assertTest(
      'TEST 7: pdf_report contains non-empty download_url',
      Boolean(orchestrateRes.pdf_report?.download_url.includes('/api/agent/reports/download/')),
      `Invalid download_url: ${orchestrateRes.pdf_report?.download_url}`
    );
  } catch (err: any) {
    assertTest('TEST 6 & 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS: Run Phase 1 & Phase 2 Test Suites
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phase 1 & Phase 2)');
  console.log('------------------------------------------------------------');

  const p1Res = await runAiPhase1Tests();
  assertTest('REGRESSION: Phase 1 Test Suite Passed', p1Res.passed >= 18, `Phase 1 failed: ${p1Res.failures.join(', ')}`);

  const p2Res = await runAiPhase2Tests();
  assertTest('REGRESSION: Phase 2 Test Suite Passed', p2Res.passed === 14, `Phase 2 failed: ${p2Res.failures.join(', ')}`);

  console.log(`\n============================================================`);
  console.log(`Phase 3 PDF Engine Test Summary: ${passed}/${total} PASSED`);
  console.log(`============================================================\n`);

  return { total, passed, failures };
}

// Auto-run if executed directly via tsx
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase3Tests')) {
  runAiPhase3Tests().catch(err => {
    console.error('Fatal error running Phase 3 PDF Engine tests:', err);
    process.exit(1);
  });
}
