# Biome Linting Fixes - TODO List

## Overview
Fix all Biome linting errors detected in the pre-commit hook to ensure code quality and consistency.

## Issues to Fix

### 1. Code Style Issues
- [ ] `src/lib/utils.ts:222` - Replace string concatenation with template literal
- [ ] `src/app/api/users/[id]/route.ts:12` - Replace `isNaN` with `Number.isNaN`

### 2. File Naming Convention Issues  
- [ ] Rename `src/app/actions/staffAssignments.ts` to `staff-assignments.ts`
- [ ] Update imports in files that reference the old filename
- [ ] Rename `src/lib/dal/staffAssignments.ts` to `staff-assignments.ts`
- [ ] Update imports in files that reference the old filename

### 3. Unused Parameter Issues
- [ ] `src/app/api/users/[id]/route.ts:7` - Rename unused `request` parameter to `_request`

### 4. Unused Import Issues
- [ ] `guide/app_eventi/modern-hero-section.tsx` - Remove unused React imports
- [ ] `src/app/api/users/route.ts` - Remove unused `eq` import
- [ ] `src/components/dashboard/events/EventCard.tsx` - Remove unused icon imports
- [ ] `src/components/dashboard/events/EventHeader.tsx` - Remove unused `Copy` import
- [ ] `src/components/dashboard/events/ParticipantsTable.tsx` - Remove unused icon imports
- [ ] `src/components/dashboard/events/ParticipantsTable.tsx` - Remove unused function imports
- [ ] `src/components/ui/calendar.tsx` - Remove unused icon imports
- [ ] `src/lib/db/seed.ts` - Remove unused `agenda` import

## Implementation Steps
1. Fix code style issues in utils.ts and API routes
2. Rename files and update all references
3. Remove unused imports systematically
4. Test the fixes by running biome check
5. Commit the changes

## Files to Check After Changes
- All import statements in the codebase
- Pre-commit hooks
- Package.json scripts if any reference the old filenames
