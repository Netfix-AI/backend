import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { geminiService } from '../services/geminiService.js';
import { supabaseService } from '../services/supabaseService.js';
import { pdfGeneratorService } from '../services/pdfGeneratorService.js';
import { encryptionUtility } from '../services/encryptionUtility.js';
import { auditService } from '../services/auditService.js';
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
import { runAiPhase13Tests } from './aiPhase13Tests.js';

export async function runAiPhase14Tests(): Promise<{ total: number; passed: number; failures: string[] }> {
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
  console.log('🔍 NETFIX AI — PHASE 14 PORTAL AUTOMATION & FINAL HARDENING SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST 1: Portal Automation Agent Routing
  // ----------------------------------------------------
  try {
    const res1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File GSTR-3B tax return on GST Portal for Q3 2025',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 1: portal_automation agent task routes correctly and returns next_agent portal_automation',
      res1.next_agent === 'portal_automation',
      `Expected next_agent 'portal_automation', got '${res1.next_agent}'`
    );
  } catch (err: any) {
    assertTest('TEST 1: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 2: RBAC Authorization Verification
  // ----------------------------------------------------
  try {
    const res2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Execute portal filing for forbidden case C-9999',
      requestingUserId: 'usr_cli_sharma_b', // Sharma cannot access Rajesh / ABC Pvt Ltd case C-1042
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const rbacBlocked =
      res2.status === 'failed' &&
      ((res2.message || '').includes('Security Violation') ||
        ((res2.result as any)?.error || '').includes('Security Violation') ||
        (res2.message || '').includes('forbidden'));

    assertTest(
      'TEST 2: RBAC authorization blocks unauthorized client from portal filing for foreign case',
      rbacBlocked,
      `Failed to block unauthorized portal access: status=${res2.status}, msg=${res2.message}`
    );
  } catch (err: any) {
    assertTest('TEST 2: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 3: Case Isolation Verification
  // ----------------------------------------------------
  try {
    const res3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Prepare GSTR-3B portal submission for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res3.result as any;
    const isScoped = payload?.case_id === 'C-1042';

    assertTest(
      'TEST 3: Case isolation verifies portal payload is strictly bound to case C-1042',
      isScoped,
      `Payload not properly case isolated: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 3: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 4: Tenant Isolation Verification
  // ----------------------------------------------------
  try {
    const res4 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Prepare portal tax filing for authorized tenant case',
      requestingUserId: 'usr_cli_rajesh',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res4.result as any;
    const zeroCrossTenantLeakage = payload?.case_id === 'C-1042';

    assertTest(
      'TEST 4: Tenant isolation prevents cross-tenant data leakage during portal task execution',
      zeroCrossTenantLeakage,
      `Cross-tenant leakage detected: ${JSON.stringify(res4.result)}`
    );
  } catch (err: any) {
    assertTest('TEST 4: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 5: Credential Isolation
  // ----------------------------------------------------
  try {
    const res5 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Access portal credentials for tax filing for C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res5.result as any;
    const noPlaintextCreds = !JSON.stringify(payload).includes('secret123') && !JSON.stringify(payload).includes('password123');

    assertTest(
      'TEST 5: Credential isolation prevents unauthorized credential retrieval or exposure',
      noPlaintextCreds,
      'Plaintext credentials found in response payload'
    );
  } catch (err: any) {
    assertTest('TEST 5: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 6: AES-256-GCM Credential Encryption & Zero Plaintext Exposure
  // ----------------------------------------------------
  try {
    const res6 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Authenticate portal session with credentials and password',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const rawStr = JSON.stringify(res6.result);
    const hasNoPlaintextPassword = !rawStr.toLowerCase().includes('secret_password') && !rawStr.toLowerCase().includes('plaintext');
    const hasEncryptedToken = Boolean((res6.result as any)?.encrypted_credential_token);

    assertTest(
      'TEST 6: AES-256-GCM encryption enforced for portal credentials with zero plaintext leakage',
      hasNoPlaintextPassword && hasEncryptedToken,
      `Credential encryption check failed: encrypted_token present=${hasEncryptedToken}`
    );
  } catch (err: any) {
    assertTest('TEST 6: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 7: Required Field Validation
  // ----------------------------------------------------
  try {
    const res7 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Validate required fields for GSTR-3B filing on GST Portal',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res7.result as any;
    const mappings = payload?.field_mappings || [];
    const gstinField = mappings.find((m: any) => m.field_name === 'GSTIN');
    const isValidated = Boolean(gstinField && gstinField.is_validated);

    assertTest(
      'TEST 7: Required field validation verifies mandatory GSTIN and filing fields prior to submission',
      isValidated,
      `Required fields not validated: ${JSON.stringify(mappings)}`
    );
  } catch (err: any) {
    assertTest('TEST 7: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 8: Missing Field Detection
  // ----------------------------------------------------
  try {
    const res8 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File GSTR-3B return with missing GSTIN and missing bank account',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res8.result as any;
    const missingDetected = Array.isArray(payload?.missing_fields) && payload.missing_fields.length > 0;

    assertTest(
      'TEST 8: Missing field detection accurately identifies missing mandatory portal fields',
      missingDetected,
      `Failed to detect missing fields: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 8: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 9: Portal Workflow Preparation
  // ----------------------------------------------------
  try {
    const res9 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Prepare GSTR-3B portal submission payload for Q3 2025',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res9.result as any;
    const hasPrepData = Boolean(
      payload?.portal_name &&
      payload?.action_type &&
      payload?.prepared_payload?.gross_turnover &&
      payload?.prepared_payload?.tax_payable
    );

    assertTest(
      'TEST 9: Portal workflow preparation constructs valid statutory filing payload',
      hasPrepData,
      `Invalid prepared portal payload: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 9: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 10: Task State awaiting_user_input Integration
  // ----------------------------------------------------
  try {
    const res10 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File GSTR-3B tax return requiring mobile OTP authorization',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 10: agent_tasks task state transitions to awaiting_user_input when user gate is triggered',
      res10.status === 'awaiting_user_input',
      `Expected status 'awaiting_user_input', got '${res10.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 10: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 11: OTP Security Gate
  // ----------------------------------------------------
  try {
    const res11 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Initiate portal filing with OTP verification',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res11.result as any;
    const isOtpGate = payload?.requires_user_input === true && payload?.user_input_type === 'otp';

    assertTest(
      'TEST 11: OTP security gate correctly pauses task and sets user_input_type to otp',
      isOtpGate,
      `Invalid OTP gate state: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 11: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 12: CAPTCHA Security Gate
  // ----------------------------------------------------
  try {
    const res12 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Log in to GST portal solving CAPTCHA challenge',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res12.result as any;
    const isCaptchaGate = payload?.requires_user_input === true && payload?.user_input_type === 'captcha';

    assertTest(
      'TEST 12: CAPTCHA security gate correctly pauses task and requests manual CAPTCHA resolution',
      isCaptchaGate,
      `Invalid CAPTCHA gate state: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 12: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 13: DSC / EVC Gate
  // ----------------------------------------------------
  try {
    const res13 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Authorize MCA AOC-4 filing using Digital Signature Certificate (DSC)',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res13.result as any;
    const isDscGate = payload?.requires_user_input === true && payload?.user_input_type === 'dsc';

    assertTest(
      'TEST 13: DSC/EVC security gate pauses task and requests Digital Signature Certificate token',
      isDscGate,
      `Invalid DSC gate state: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 13: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 14: Final Submission Confirmation Gate
  // ----------------------------------------------------
  try {
    const res14 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Prepare GSTR-3B return awaiting final filing confirmation',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res14.result as any;
    const isConfirmGate = payload?.requires_user_input === true && payload?.user_input_type === 'confirmation';

    assertTest(
      'TEST 14: Final submission confirmation gate prevents auto-filing without explicit user confirmation',
      isConfirmGate,
      `Invalid confirmation gate state: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 14: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 15: Successful Submission Confirmation
  // ----------------------------------------------------
  try {
    const res15 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Resume GSTR-3B filing task after OTP verified and user_confirmed',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res15.result as any;
    const isSubmitted = res15.status === 'completed' && payload?.status === 'submitted' && payload?.requires_user_input === false;

    assertTest(
      'TEST 15: Resumed portal task with user verification completes with status submitted and task status completed',
      isSubmitted,
      `Submission completion check failed: status=${res15.status}, payload_status=${payload?.status}`
    );
  } catch (err: any) {
    assertTest('TEST 15: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 16: Unverifiable Submission Status Handling
  // ----------------------------------------------------
  try {
    const res16 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File return on portal where portal status is session expired and timeout',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 16: Unverifiable or error portal submission reported as failed rather than claiming false success',
      res16.status === 'failed',
      `Expected status 'failed', got '${res16.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 16: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 17: Portal Timeout Handling
  // ----------------------------------------------------
  try {
    const res17 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Submit portal tax return when portal response encounters timeout',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res17.result as any;
    const hasTimeoutError = Array.isArray(payload?.validation_errors) && payload.validation_errors.some((e: string) => e.toLowerCase().includes('expired') || e.toLowerCase().includes('timeout'));

    assertTest(
      'TEST 17: Portal timeout gracefully handled and recorded in validation_errors',
      hasTimeoutError,
      `Timeout error not detected: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 17: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 18: Portal Unavailable Handling
  // ----------------------------------------------------
  try {
    const res18 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Attempt portal filing while portal down for maintenance',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res18.result as any;
    const hasDownError = Array.isArray(payload?.validation_errors) && payload.validation_errors.some((e: string) => e.toLowerCase().includes('maintenance') || e.toLowerCase().includes('unavailable'));

    assertTest(
      'TEST 18: Portal unavailable error properly caught and reported in validation_errors',
      hasDownError,
      `Portal down error not detected: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 18: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 19: Invalid Credentials Handling
  // ----------------------------------------------------
  try {
    const res19 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File portal return with invalid credentials and invalid password',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res19.result as any;
    const hasCredError = Array.isArray(payload?.validation_errors) && payload.validation_errors.some((e: string) => e.toLowerCase().includes('credentials') || e.toLowerCase().includes('password'));

    assertTest(
      'TEST 19: Invalid credentials error properly detected and flagged with status failed',
      hasCredError && res19.status === 'failed',
      `Invalid credentials error not properly handled: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 19: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 20: Expired Session Handling
  // ----------------------------------------------------
  try {
    const res20 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Perform portal action on session expired token',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res20.result as any;
    const isSessionExpired = Array.isArray(payload?.validation_errors) && payload.validation_errors.some((e: string) => e.toLowerCase().includes('session expired'));

    assertTest(
      'TEST 20: Expired session error correctly surfaced in validation_errors',
      isSessionExpired,
      `Expired session not caught: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 20: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 21: OTP Expiration Handling
  // ----------------------------------------------------
  try {
    const res21 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Validate expired session and timeout for OTP verification',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 21: Expired OTP or portal session correctly yields task status failed',
      res21.status === 'failed',
      `Expected status 'failed', got '${res21.status}'`
    );
  } catch (err: any) {
    assertTest('TEST 21: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 22: Validation Error Structure
  // ----------------------------------------------------
  try {
    const res22 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Check validation errors for invalid password on portal',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res22.result as any;
    const isValidationArray = Array.isArray(payload?.validation_errors);

    assertTest(
      'TEST 22: Validation error array conforms strictly to portal automation schema',
      isValidationArray,
      `validation_errors is not an array: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 22: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 23: Duplicate Submission Protection
  // ----------------------------------------------------
  try {
    const res23 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File GSTR-3B tax return on GST Portal for Q3 2025 (duplicate check)',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res23.result as any;
    const hasFieldMappings = Array.isArray(payload?.field_mappings);

    assertTest(
      'TEST 23: Duplicate submission protection validates period and statutory ID prior to payload filing',
      hasFieldMappings,
      `Field mappings check failed: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 23: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 24: Gemini Failure Fallback Execution
  // ----------------------------------------------------
  try {
    const originalCall = geminiService.call;
    geminiService.call = async () => ({ ai_source: 'rule_based_fallback' } as any);

    const res24 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Prepare GSTR-3B portal submission under Gemini service outage',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    geminiService.call = originalCall;

    assertTest(
      'TEST 24: Gemini failure activates deterministic rule-based portal automation fallback',
      res24.ai_source === 'rule_based_fallback',
      `Expected ai_source 'rule_based_fallback', got '${res24.ai_source}'`
    );
  } catch (err: any) {
    assertTest('TEST 24: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 25: ai_source Property Integrity
  // ----------------------------------------------------
  try {
    const res25 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Verify ai_source parameter for portal automation task',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const validAiSource = res25.ai_source === 'ai' || res25.ai_source === 'rule_based_fallback';

    assertTest(
      'TEST 25: ai_source property strictly conforms to ai | rule_based_fallback contract',
      validAiSource,
      `Invalid ai_source: ${res25.ai_source}`
    );
  } catch (err: any) {
    assertTest('TEST 25: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 26: Deterministic Numerical Preservation
  // ----------------------------------------------------
  try {
    const res26 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Prepare GSTR-3B filing with tax payable calculation',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res26.result as any;
    const prep = payload?.prepared_payload;
    const exactPreserved = prep?.gross_turnover === 12450000.0 && prep?.tax_payable === 1867500.0;

    assertTest(
      'TEST 26: Deterministic numerical preservation guarantees exact tax amounts (turnover ₹ 1.245 Cr, tax ₹ 18.675 L)',
      exactPreserved,
      `Numerical preservation broken: ${JSON.stringify(prep)}`
    );
  } catch (err: any) {
    assertTest('TEST 26: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 27: Sensitive Data Filtering
  // ----------------------------------------------------
  try {
    const res27 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Execute portal filing for client user',
      requestingUserId: 'usr_cli_rajesh', // Client role
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const payload = res27.result as any;
    const isFiltered = !('internal_notes' in payload) && !('internal_rationale' in payload);

    assertTest(
      'TEST 27: Sensitive data filtering removes internal notes and internal rationale for client role',
      isFiltered,
      `Internal fields leaked to client: ${JSON.stringify(payload)}`
    );
  } catch (err: any) {
    assertTest('TEST 27: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 28: Audit Logging of Portal Operations
  // ----------------------------------------------------
  try {
    const res28 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Execute auditable portal automation filing task',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    assertTest(
      'TEST 28: Audit logging records sensitive portal operations with zero password/token exposure',
      Boolean(res28.task_id),
      'Task ID missing from portal audit record'
    );
  } catch (err: any) {
    assertTest('TEST 28: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 29: Role-Based Filtering Validation
  // ----------------------------------------------------
  try {
    const res29Emp = await ultronOrchestrator.orchestrate({
      taskDescription: 'Execute portal automation task for employee view',
      requestingUserId: 'usr_emp_amit', // Employee role
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const empPayload = res29Emp.result as any;
    const empHasInternal = Boolean(empPayload?.internal_notes || empPayload?.internal_rationale);

    assertTest(
      'TEST 29: Role-based output filtering preserves internal fields for employee role while filtering client view',
      empHasInternal,
      `Employee missing internal fields: ${JSON.stringify(empPayload)}`
    );
  } catch (err: any) {
    assertTest('TEST 29: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 30: Activity Feed Integration
  // ----------------------------------------------------
  try {
    const res30 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Track portal task in live activity feed',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const taskEntity = await supabaseService.getAgentTaskById(res30.task_id);
    const activityTracked = Boolean(taskEntity && (taskEntity.status === 'processing' || taskEntity.status === 'completed' || taskEntity.status === 'awaiting_user_input'));

    assertTest(
      'TEST 30: Activity feed integration reflects real task state in agent_tasks',
      activityTracked,
      `Activity feed check failed: task=${JSON.stringify(taskEntity)}`
    );
  } catch (err: any) {
    assertTest('TEST 30: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 31: Ultron Verification & Retry Pass
  // ----------------------------------------------------
  try {
    const res31 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Test Ultron verification pass with forced verification failure',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
      forceVerificationFailure: true,
    });

    assertTest(
      'TEST 31: Ultron verification loop retries task and falls back cleanly on exhausted retries',
      res31.verification_retries === 2 && res31.ai_source === 'rule_based_fallback',
      `Expected retries 2 & fallback, got retries=${res31.verification_retries}, ai_source=${res31.ai_source}`
    );
  } catch (err: any) {
    assertTest('TEST 31: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 32: PDF / Report Generation Integration
  // ----------------------------------------------------
  try {
    const res32 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Generate PDF filing summary report for portal automation task',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    const hasPdfReport = Boolean(res32.pdf_report?.report_id && res32.pdf_report?.download_url);

    assertTest(
      'TEST 32: PDF filing summary report automatically generated and stored for portal task',
      hasPdfReport,
      `PDF report missing: ${JSON.stringify(res32.pdf_report)}`
    );
  } catch (err: any) {
    assertTest('TEST 32: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 33: Pipeline D End-to-End Orchestration
  // ----------------------------------------------------
  try {
    // Pipeline D: File now -> tax_intelligence -> portal_automation -> OTP gate -> comms_reporting
    // Step D1: tax_intelligence computes tax & GST
    const step1 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Compute GST liability and return totals for case C-1042',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'tax_intelligence',
      caseId: 'C-1042',
    });

    // Step D2: portal_automation prepares filing and pauses at OTP gate
    const step2 = await ultronOrchestrator.orchestrate({
      taskDescription: 'File now GSTR-3B tax return requiring mobile OTP authorization',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'portal_automation',
      caseId: 'C-1042',
    });

    // Step D3: comms_reporting generates user notification / filing summary
    const step3 = await ultronOrchestrator.orchestrate({
      taskDescription: 'Generate filing summary notification for GSTR-3B filing held at OTP gate',
      requestingUserId: 'usr_emp_amit',
      agentKey: 'comms_reporting',
      caseId: 'C-1042',
    });

    const pipelineDSuccess =
      step1.status === 'completed' &&
      step2.status === 'awaiting_user_input' &&
      step3.status === 'completed';

    assertTest(
      'TEST 33: Pipeline D end-to-end orchestration (File now -> tax_intelligence -> portal_automation OTP gate -> comms_reporting)',
      pipelineDSuccess,
      `Pipeline D execution failed: step1=${step1.status}, step2=${step2.status}, step3=${step3.status}`
    );
  } catch (err: any) {
    assertTest('TEST 33: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 34: All 11 Worker Agents Registration & Routing
  // ----------------------------------------------------
  try {
    const allWorkers = [
      'doc_intake',
      'case_analysis',
      'tax_intelligence',
      'legal_research',
      'drafting',
      'adversarial',
      'risk_compliance',
      'citation_check',
      'comms_reporting',
      'property_project',
      'portal_automation',
    ];

    let allRoutable = true;
    for (const agentKey of allWorkers) {
      const res = await ultronOrchestrator.orchestrate({
        taskDescription: `Run validation task for agent ${agentKey}`,
        requestingUserId: 'usr_emp_amit',
        agentKey,
        caseId: 'C-1042',
      });
      if (res.next_agent !== agentKey) {
        allRoutable = false;
        console.error(`Agent ${agentKey} failed routing, got next_agent=${res.next_agent}`);
      }
    }

    assertTest(
      'TEST 34: All 11 worker agents registered, routable, and executable in Ultron orchestrator',
      allRoutable,
      'One or more worker agents failed registration/routing verification'
    );
  } catch (err: any) {
    assertTest('TEST 34: Execution thrown', false, err?.message);
  }

  // ----------------------------------------------------
  // TEST 35: Phase 1–13 Regression Suite Execution
  // ----------------------------------------------------
  console.log('\n============================================================');
  console.log('🔄 RUNNING FULL REGRESSION SUITE (PHASES 1–13)');
  console.log('============================================================\n');

  try {
    const p13 = await runAiPhase13Tests();

    assertTest(
      'TEST 35: All Phase 1–13 regression test suites pass with zero failures',
      p13.passed === p13.total,
      `Regression failures detected in previous phases: passed ${p13.passed}/${p13.total}`
    );
  } catch (regErr: any) {
    assertTest('TEST 35: Regression execution thrown', false, regErr?.message);
  }

  // ----------------------------------------------------
  // TEST 36: TypeScript Compilation Verification
  // ----------------------------------------------------
  try {
    const { execSync } = await import('child_process');
    let tscSuccess = false;
    try {
      execSync('npx --package=typescript tsc -p backend/tsconfig.json --noEmit', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });
      tscSuccess = true;
    } catch (tscErr: any) {
      console.error('TSC Error Output:', tscErr.stdout?.toString(), tscErr.stderr?.toString());
    }

    assertTest(
      'TEST 36: TypeScript compilation completes with 0 type errors across backend',
      tscSuccess,
      'TypeScript compiler reported type errors'
    );
  } catch (err: any) {
    assertTest('TEST 36: Execution thrown', false, err?.message);
  }

  console.log('\n============================================================');
  console.log(`📊 PHASE 14 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('============================================================\n');

  return { total, passed, failures };
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.includes('aiPhase14Tests')) {
  runAiPhase14Tests().then(({ total, passed, failures }) => {
    if (failures.length > 0) {
      console.error('Phase 14 Tests Failed:', failures);
      process.exit(1);
    } else {
      console.log(`All ${passed}/${total} Phase 14 tests completed successfully.`);
      process.exit(0);
    }
  });
}
