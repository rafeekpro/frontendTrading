---
issue: 18
title: Login and Register UI components
analyzed: 2025-10-26T11:20:22Z
estimated_hours: 6
parallelization_factor: 1.5
---

# Parallel Work Analysis: Issue #18

## Overview
Enhance existing Login page with Zod validation and create new Register page with password strength indicator. Current Login page exists but lacks schema validation and proper error handling.

## Current State Assessment

### Existing Implementation (Login.tsx)
- ✅ Basic Login page with email/password fields
- ✅ AuthContext integration (login function)
- ✅ Error display from AuthContext
- ✅ Loading state handling
- ✅ Navigation after successful login
- ❌ No Zod schema validation
- ❌ No React Hook Form integration
- ❌ Basic HTML validation only (`required`, `type="email"`)
- ❌ No client-side validation rules

### Missing Components
- ❌ Register page (completely missing)
- ❌ Password strength indicator component
- ❌ Zod validation schemas
- ❌ React Hook Form integration
- ❌ Form validation error messages (field-specific)

### Dependencies to Install
```json
{
  "zod": "^3.24.2",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x"
}
```

## Parallel Streams

### Stream A: Zod Schemas & Password Strength Indicator
**Scope**: Create reusable validation schemas and password strength component
**Files**:
- `src/lib/validations/auth.ts` (NEW) - Zod schemas for login/register
- `src/components/PasswordStrengthIndicator.tsx` (NEW) - Password strength UI
- `src/components/__tests__/PasswordStrengthIndicator.test.tsx` (NEW)
- `src/lib/validations/__tests__/auth.test.ts` (NEW)

**Agent Type**: `react-frontend-engineer`
**Can Start**: immediately
**Estimated Hours**: 2.5h
**Dependencies**: none

**Tasks**:
1. 🔴 RED: Write failing tests for Zod schemas (login, register)
2. 🟢 GREEN: Create auth validation schemas with:
   - Email validation (z.email())
   - Password validation (min 8 chars, complexity rules)
   - Password confirmation matching
   - Name validation for register
3. 🔴 RED: Write failing tests for PasswordStrengthIndicator
4. 🟢 GREEN: Implement password strength component:
   - Calculate strength (weak/medium/strong)
   - Visual indicator (progress bar or color-coded)
   - Requirements checklist display
5. ♻️ REFACTOR: Optimize and clean up

**Acceptance Criteria**:
- [ ] Zod schemas validate email format
- [ ] Password requires: 8+ chars, uppercase, lowercase, number
- [ ] Password confirmation matches
- [ ] Strength indicator shows visual feedback
- [ ] All tests passing

---

### Stream B: Enhanced Login Page with React Hook Form
**Scope**: Refactor existing Login page to use React Hook Form + Zod
**Files**:
- `src/pages/Login.tsx` (MODIFY) - Add React Hook Form integration
- `src/pages/__tests__/Login.test.tsx` (NEW) - Component tests

**Agent Type**: `react-frontend-engineer`
**Can Start**: after Stream A completes (needs Zod schemas)
**Estimated Hours**: 2h
**Dependencies**: Stream A (needs `src/lib/validations/auth.ts`)

**Tasks**:
1. 🔴 RED: Write failing tests for Login form validation
2. 🟢 GREEN: Refactor Login.tsx:
   - Replace useState with useForm from react-hook-form
   - Integrate zodResolver with login schema
   - Add field-level error messages
   - Maintain existing AuthContext integration
   - Keep demo credentials display
3. ♻️ REFACTOR: Extract form fields to reusable Input components if needed

**Acceptance Criteria**:
- [ ] Form uses React Hook Form + Zod validation
- [ ] Email validation shows errors on blur
- [ ] Password validation shows errors on blur
- [ ] Submit button disabled while loading
- [ ] Error messages are user-friendly
- [ ] Demo credentials still visible
- [ ] Tests passing

---

### Stream C: Register Page
**Scope**: Create new Register page with password strength indicator
**Files**:
- `src/pages/Register.tsx` (NEW)
- `src/pages/__tests__/Register.test.tsx` (NEW)
- `src/App.tsx` (MODIFY) - Add /register route

**Agent Type**: `react-frontend-engineer`
**Can Start**: after Stream A completes (needs schemas + PasswordStrengthIndicator)
**Estimated Hours**: 1.5h
**Dependencies**: Stream A (needs validation schemas and PasswordStrengthIndicator)

**Tasks**:
1. 🔴 RED: Write failing tests for Register form
2. 🟢 GREEN: Create Register.tsx:
   - Form fields: name, email, password, confirmPassword
   - React Hook Form + Zod resolver
   - Password strength indicator integration
   - Submit to MSW /api/auth/register endpoint
   - Success: redirect to /login with success message
   - Link to Login page for existing users
3. 🟢 GREEN: Add /register route to App.tsx
4. ♻️ REFACTOR: Share common form styling with Login

**Acceptance Criteria**:
- [ ] Register form with all required fields
- [ ] Password strength indicator visible
- [ ] Password confirmation validation works
- [ ] Successful registration redirects to /login
- [ ] Link to Login page present
- [ ] Tests passing

---

## Coordination Points

### Shared Files
- `package.json` - Stream A (add dependencies: zod, react-hook-form, @hookform/resolvers)
- `src/App.tsx` - Stream C (add /register route)
- `src/lib/validations/auth.ts` - Streams B & C depend on this from Stream A

### Sequential Requirements
1. **Stream A first**: Must complete Zod schemas before B & C can start
2. **Streams B & C in parallel**: Once A is done, B and C can work independently
3. **Final integration**: After B & C complete, verify end-to-end flow

### Type Definitions
Stream A will define:
```typescript
// src/lib/validations/auth.ts
export const loginSchema = z.object({...});
export const registerSchema = z.object({...});
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

## Conflict Risk Assessment
- **Low Risk**: Streams work on different files (Login.tsx vs Register.tsx)
- **No Conflicts**: Stream A creates new files, B & C modify different existing files
- **Coordination Needed**: Stream A must complete before B & C start

## Parallelization Strategy

**Recommended Approach**: Sequential-then-Parallel (Hybrid)

**Phase 1 (Sequential)**:
- Complete Stream A (Zod schemas + PasswordStrengthIndicator)
- Time: 2.5 hours

**Phase 2 (Parallel)**:
- Launch Streams B & C simultaneously after A completes
- Time: max(2h, 1.5h) = 2 hours

## Expected Timeline

### With parallel execution:
- **Wall time**: 2.5h (Stream A) + 2h (max of B & C in parallel) = **4.5 hours**
- **Total work**: 2.5h + 2h + 1.5h = 6 hours
- **Efficiency gain**: 25% time savings

### Without parallel execution:
- **Wall time**: 2.5h + 2h + 1.5h = **6 hours**

## TDD Workflow

All streams follow **RED-GREEN-REFACTOR**:

### Stream A
```bash
# RED: Zod schemas
touch src/lib/validations/__tests__/auth.test.ts
# Write failing tests
npm test -- auth.test.ts  # MUST FAIL ❌

# GREEN: Implement
touch src/lib/validations/auth.ts
npm test -- auth.test.ts  # MUST PASS ✅

# REFACTOR
npm test  # ALL MUST STAY GREEN ✅

# RED: Password strength component
touch src/components/__tests__/PasswordStrengthIndicator.test.tsx
npm test -- PasswordStrengthIndicator.test.tsx  # MUST FAIL ❌

# GREEN: Implement
touch src/components/PasswordStrengthIndicator.tsx
npm test -- PasswordStrengthIndicator.test.tsx  # MUST PASS ✅

# REFACTOR
npm test  # ALL MUST STAY GREEN ✅
```

### Stream B
```bash
# RED: Login form tests
touch src/pages/__tests__/Login.test.tsx
npm test -- Login.test.tsx  # MUST FAIL ❌

# GREEN: Refactor Login.tsx
npm test -- Login.test.tsx  # MUST PASS ✅

# REFACTOR
npm test  # ALL MUST STAY GREEN ✅
```

### Stream C
```bash
# RED: Register form tests
touch src/pages/__tests__/Register.test.tsx
npm test -- Register.test.tsx  # MUST FAIL ❌

# GREEN: Implement Register.tsx
npm test -- Register.test.tsx  # MUST PASS ✅

# REFACTOR
npm test  # ALL MUST STAY GREEN ✅
```

## MSW Integration

### Existing Auth Handlers
Already exist in `src/mocks/handlers/auth.ts`:
- ✅ POST /api/auth/login
- ✅ POST /api/auth/logout
- ✅ GET /api/auth/me
- ❓ POST /api/auth/register (verify exists, may need enhancement)

**Action**: Stream C should verify `/api/auth/register` handler supports:
- Name field in request body
- Returns appropriate success/error responses

## Notes

### Context7 Best Practices Applied
Based on documentation from `/react-hook-form/react-hook-form` and `/colinhacks/zod`:
- Use `useForm` with `zodResolver` for schema integration
- Register inputs with `{...register('fieldName')}`
- Display errors from `formState.errors`
- Use `handleSubmit` to wrap submit handler
- Apply validation on blur (`mode: 'onBlur'` in useForm config)
- Use Zod's `.email()` for email validation
- Use `.min(8)` with custom password regex for password strength

### Password Strength Requirements
Implement progressive disclosure:
- **Weak**: < 8 chars or missing requirements
- **Medium**: 8+ chars, 2-3 requirement types met
- **Strong**: 8+ chars, all requirements met (uppercase, lowercase, number, special char)

### UI/UX Considerations
- Field-level error messages (not just form-level)
- Clear password requirements before user starts typing
- Real-time password strength feedback
- Disable submit button until form is valid
- Success feedback on registration
- Link between Login ↔ Register pages

### Testing Strategy
- Unit tests for Zod schemas (validation rules)
- Unit tests for PasswordStrengthIndicator (all strength levels)
- Component tests for Login form (validation, submission, errors)
- Component tests for Register form (validation, submission, password matching)
- E2E tests can be added later (separate task)

### Files Created/Modified Summary
**New Files (7)**:
- `src/lib/validations/auth.ts`
- `src/lib/validations/__tests__/auth.test.ts`
- `src/components/PasswordStrengthIndicator.tsx`
- `src/components/__tests__/PasswordStrengthIndicator.test.tsx`
- `src/pages/Register.tsx`
- `src/pages/__tests__/Register.test.tsx`
- `src/pages/__tests__/Login.test.tsx`

**Modified Files (2)**:
- `src/pages/Login.tsx` (refactor to use React Hook Form + Zod)
- `src/App.tsx` (add /register route)
- `package.json` (add dependencies)

### Success Criteria
- [ ] All 3 streams completed following TDD
- [ ] All tests passing (unit + component)
- [ ] Login page uses Zod validation
- [ ] Register page created with password strength indicator
- [ ] Both forms have proper error handling
- [ ] User can navigate between Login ↔ Register
- [ ] Code follows project style guide
- [ ] No TypeScript errors
- [ ] No console warnings

---
**Analysis completed**: 2025-10-26T11:20:22Z
**Ready for**: `/pm:issue-start 18`
