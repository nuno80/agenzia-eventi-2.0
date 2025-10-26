// ============================================================================
// DATA ACCESS LAYER - INDEX
// ============================================================================
// FILE: src/lib/dal/index.ts
//
// PURPOSE: Export all Data Access Layer modules for easy importing
// BENEFITS:
// - Centralized imports
// - Better code organization
// - Simplified imports in components
//
// USAGE:
// In Server Components:
//   import { getEventById, getParticipantById } from '@/lib/dal';
//   const event = await getEventById('123');
//   const participant = await getParticipantById('456');
// ============================================================================

// Export all DAL modules
export * from './events'
export * from './participants'
export * from './speakers'
export * from './sponsors'
export * from './services'
export * from './budgetCategories'
export * from './deadlines'
export * from './communications'
export * from './surveys'
export * from './checkins'
export * from './agenda'
