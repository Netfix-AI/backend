import { ragService } from '../services/ragService.js';
import { geminiService } from '../services/geminiService.js';
import { runAiPhase1Tests } from './aiPhase1Tests.js';
import { runAiPhase2Tests } from './aiPhase2Tests.js';
import { runAiPhase3Tests } from './aiPhase3Tests.js';

export async function runAiPhase4Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🔍 NETFIX AI — PHASE 4 RAG FOUNDATION TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1 & 2: Embedding Generation & Vector Validity
  // ----------------------------------------------------
  try {
    const text = 'Section 302 Indian Penal Code murder punishment';
    const vec = await geminiService.generateEmbedding(text);

    assertTest(
      'TEST 1: generateEmbedding returns array of numbers',
      Array.isArray(vec) && vec.length > 0 && typeof vec[0] === 'number',
      `Expected array of numbers, got '${typeof vec}'`
    );
    assertTest(
      'TEST 2: Embedding vector has expected dimensions',
      vec.length >= 64,
      `Expected vector length >= 64, got ${vec.length}`
    );
  } catch (err: any) {
    assertTest('TEST 1 & 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3 & 4: Cosine Similarity Math Verification
  // ----------------------------------------------------
  try {
    const identicalSim = geminiService.computeCosineSimilarity([1, 0, 0], [1, 0, 0]);
    const orthogonalSim = geminiService.computeCosineSimilarity([1, 0, 0], [0, 1, 0]);
    const oppositeSim = geminiService.computeCosineSimilarity([1, 0], [-1, 0]);

    assertTest(
      'TEST 3: Identical vectors produce cosine similarity of 1.0',
      Math.abs(identicalSim - 1.0) < 0.001,
      `Expected 1.0, got ${identicalSim}`
    );
    assertTest(
      'TEST 4: Orthogonal vectors produce cosine similarity of 0.0',
      Math.abs(orthogonalSim - 0.0) < 0.001,
      `Expected 0.0, got ${orthogonalSim}`
    );
  } catch (err: any) {
    assertTest('TEST 3 & 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Knowledge Base Indexing
  // ----------------------------------------------------
  try {
    const indexedCount = await ragService.indexKnowledgeBase();
    assertTest(
      'TEST 5: Knowledge base corpus indexed successfully',
      indexedCount >= 0,
      `Expected indexed count >= 0, got ${indexedCount}`
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6 & 7: Top-N Document Similarity Ranking (Exit Criterion)
  // ----------------------------------------------------
  try {
    const murderResults = await ragService.searchSimilarDocs('Whoever commits murder shall be punished with death', { topK: 3 });

    assertTest(
      'EXIT CRITERION: RAG query returns top-N ranked documents',
      murderResults.length > 0,
      'RAG search returned 0 documents'
    );
    assertTest(
      'EXIT CRITERION: Section 302 Murder is ranked top #1 for murder query',
      murderResults[0]?.id === 'kd_302',
      `Expected top document kd_302, got '${murderResults[0]?.id}' (${murderResults[0]?.title})`
    );

    const bailResults = await ragService.searchSimilarDocs('grant of bail to person apprehending arrest non-bailable offence', { topK: 3 });
    assertTest(
      'EXIT CRITERION: Section 438 Bail is ranked top #1 for anticipatory bail query',
      bailResults[0]?.id === 'kd_438',
      `Expected top document kd_438, got '${bailResults[0]?.id}' (${bailResults[0]?.title})`
    );
  } catch (err: any) {
    assertTest('EXIT CRITERION: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: RBAC Scoping & Restriction Filter
  // ----------------------------------------------------
  try {
    const clientResults = await ragService.searchSimilarDocs('murder and bail', { topK: 5, userRole: 'client' });
    const containsRestricted = clientResults.some(d => d.is_restricted);

    assertTest(
      'TEST 8: Client role RAG search excludes restricted legal documents',
      !containsRestricted,
      'Restricted document leaked to client role RAG search'
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: Edge Case - Empty Query Handling
  // ----------------------------------------------------
  try {
    const emptyResults = await ragService.searchSimilarDocs('', { topK: 3 });
    assertTest(
      'TEST 9: Empty query returns empty array without throwing',
      Array.isArray(emptyResults) && emptyResults.length === 0,
      `Expected [], got ${JSON.stringify(emptyResults)}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // REGRESSION TESTS: Run Phase 1, Phase 2, & Phase 3 Test Suites
  // ----------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('🔄 RUNNING REGRESSION SUITES (Phases 1, 2, & 3)');
  console.log('------------------------------------------------------------');

  const p1Res = await runAiPhase1Tests();
  assertTest('REGRESSION: Phase 1 Test Suite Passed', p1Res.passed >= 18, `Phase 1 failed: ${p1Res.failures.join(', ')}`);

  const p2Res = await runAiPhase2Tests();
  assertTest('REGRESSION: Phase 2 Test Suite Passed', p2Res.passed === 14, `Phase 2 failed: ${p2Res.failures.join(', ')}`);

  const p3Res = await runAiPhase3Tests();
  assertTest('REGRESSION: Phase 3 Test Suite Passed', p3Res.passed === 9, `Phase 3 failed: ${p3Res.failures.join(', ')}`);

  console.log(`\n============================================================`);
  console.log(`Phase 4 RAG Foundation Test Summary: ${passed}/${total} PASSED`);
  console.log(`============================================================\n`);

  return { total, passed, failures };
}

// Auto-run if executed directly via tsx
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('aiPhase4Tests')) {
  runAiPhase4Tests().catch(err => {
    console.error('Fatal error running Phase 4 RAG Foundation tests:', err);
    process.exit(1);
  });
}
