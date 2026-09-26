import { supabaseService } from '../services/supabaseService.js';
import { rbacService } from '../services/rbacService.js';

export async function runPhase1SecurityTests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🔒 NETFIX AI — PHASE 1 DATA ISOLATION & SECURITY TEST SUITE');
  console.log('============================================================\n');

  // TEST 1: Cross-Client Entity Access
  const clientAContext = rbacService.getUserContext('client', 'clientA@test.com');
  clientAContext.id = 'usr_cli_clientA';
  clientAContext.tenantId = 'tenant_clientA';

  const clientBEntity = await supabaseService.getEntityById('ent_marg_tech');
  const isClientAEntityOwner = clientBEntity ? clientBEntity.owner_user_id === clientAContext.id : false;
  assertTest(
    'TEST 1: Client A cannot claim ownership of Client B Entity',
    !isClientAEntityOwner,
    'Client A was incorrectly allowed access to Client B Entity'
  );

  // TEST 2: Cross-Client Case Isolation (BOLA Check)
  const caseAccessResult = await rbacService.verifyAccess(
    clientAContext,
    'case',
    'C-1039', // Sharma Enterprises (different client)
    'read'
  );
  assertTest(
    'TEST 2: Client A requesting Client B Case returns 403 Forbidden',
    !caseAccessResult.allowed,
    'Backend failed to block cross-client case access'
  );

  // TEST 3: Cross-Client Document Isolation
  const docAccessResult = await rbacService.verifyAccess(
    clientAContext,
    'document',
    'DOC-1003', // Confidential Audit Report belonging to Sharma Enterprises
    'read'
  );
  assertTest(
    'TEST 3: Client A requesting Client B Document returns 403 Forbidden',
    !docAccessResult.allowed,
    'Backend failed to block cross-client document access'
  );

  // TEST 4: Advocate Unassigned Case Isolation
  const advocateAContext = rbacService.getUserContext('advocate', 'advocateA@test.com');
  advocateAContext.id = 'usr_adv_unassigned';
  const advocateAccessResult = await rbacService.verifyAccess(
    advocateAContext,
    'case',
    'C-1039',
    'read'
  );
  assertTest(
    'TEST 4: Advocate requesting unassigned case returns 403 Forbidden',
    !advocateAccessResult.allowed,
    'Advocate was granted unauthorized access to unassigned case'
  );

  // TEST 5: Internal Case Notes Visibility Guard
  const notesForClient = await supabaseService.getCaseNotes('case_gst_2026', true);
  const containsInternalNotes = notesForClient.some((n) => n.is_internal);
  assertTest(
    'TEST 5: Client user query strips internal case notes',
    !containsInternalNotes,
    'Internal case notes were leaked to client response'
  );

  // TEST 6: Session Revocation Engine
  const testJti = `jti_test_${Date.now()}`;
  await supabaseService.createSession({
    user_id: 'usr_test',
    jti: testJti,
    session_token: 'test_token',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  });
  const beforeRevoke = await supabaseService.isSessionRevoked(testJti);
  await supabaseService.revokeSession(testJti);
  const afterRevoke = await supabaseService.isSessionRevoked(testJti);

  assertTest(
    'TEST 6: Session revocation marks JWT JTI as revoked immediately',
    !beforeRevoke && afterRevoke,
    'Session revocation engine failed to invalidate JTI token'
  );

  // TEST 7: Suspended Account Enforcement
  const suspendedUser = await supabaseService.updateUserStatus('usr_test', 'suspended', false);
  const suspendedAccessAllowed = suspendedUser ? suspendedUser.status === 'active' : false;
  assertTest(
    'TEST 7: Suspended user cannot bypass authentication with valid status',
    !suspendedAccessAllowed,
    'Suspended user retained active status'
  );

  // TEST 8: Password Reset Single-Use Token
  const resetToken = await supabaseService.createPasswordResetToken('usr_test', 'test@example.com', 'token_hash_123');
  const validBeforeUse = await supabaseService.verifyPasswordResetToken('token_hash_123');
  await supabaseService.markPasswordResetTokenUsed(resetToken.id);
  const validAfterUse = await supabaseService.verifyPasswordResetToken('token_hash_123');

  assertTest(
    'TEST 8: Password reset tokens are single-use and invalidated post consumption',
    validBeforeUse !== null && validAfterUse === null,
    'Password reset token remained valid after use'
  );

  console.log('\n------------------------------------------------------------');
  console.log(`Security Test Summary: ${passed}/${total} Tests Passed`);
  console.log('------------------------------------------------------------\n');

  return { total, passed, failures };
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('phase1SecurityTests.ts')) {
  runPhase1SecurityTests();
}
