/**
 * Validation threshold constants
 */

// Minimum character lengths
export const MIN_WHY_SECTION_LENGTH = 50;
export const MIN_OVERVIEW_LENGTH = 50;

// Maximum character/item limits
export const MAX_WHY_SECTION_LENGTH = 1000;
export const MAX_REQUIREMENT_TEXT_LENGTH = 500;
export const MAX_DELTAS_PER_CHANGE = 10;

// Validation messages
export const VALIDATION_MESSAGES = {
  // Required content
  GIVEN_EMPTY: 'Given clause cannot be empty',
  WHEN_EMPTY: 'When clause cannot be empty',
  THEN_EMPTY: 'Then clause cannot be empty',
  REQUIREMENT_EMPTY: 'Requirement text cannot be empty',
  REQUIREMENT_NO_SHALL: 'Requirement must contain SHALL or MUST keyword',
  REQUIREMENT_NO_SCENARIOS: 'Requirement must have at least one scenario',
  SPEC_NAME_EMPTY: 'Spec name cannot be empty',
  SPEC_OVERVIEW_EMPTY: 'Overview section cannot be empty',
  SPEC_NO_REQUIREMENTS: 'Spec must have at least one requirement',
  CHANGE_NAME_EMPTY: 'Change name cannot be empty',
  CHANGE_WHY_TOO_SHORT: `Why section must be at least ${MIN_WHY_SECTION_LENGTH} characters`,
  CHANGE_WHY_TOO_LONG: `Why section should not exceed ${MAX_WHY_SECTION_LENGTH} characters`,
  CHANGE_WHAT_EMPTY: 'What Changes section cannot be empty',
  CHANGE_NO_DELTAS: 'Change must have at least one delta',
  CHANGE_TOO_MANY_DELTAS: `Consider splitting changes with more than ${MAX_DELTAS_PER_CHANGE} deltas`,
  DELTA_SPEC_EMPTY: 'Spec name cannot be empty',
  DELTA_DESCRIPTION_EMPTY: 'Delta description cannot be empty',
  
  // Warnings
  OVERVIEW_TOO_BRIEF: `Overview section is too brief (less than ${MIN_OVERVIEW_LENGTH} characters)`,
  REQUIREMENT_TOO_LONG: `Requirement text is very long (>${MAX_REQUIREMENT_TEXT_LENGTH} characters). Consider breaking it down.`,
  DELTA_DESCRIPTION_TOO_BRIEF: 'Delta description is too brief',
  DELTA_MISSING_REQUIREMENTS: 'Delta should include requirements',
  
  // Info
  SCENARIO_NO_GIVEN_WHEN_THEN: 'Scenario does not follow Given/When/Then structure',
} as const;