/**
 * Timer Configuration Constants
 * Centralized defaults for study and break durations
 */

export const TIMER_DEFAULTS = {
  // Default durations in minutes
  STUDY_DURATION: 25,  // 25 minutes - Pomodoro standard
  BREAK_DURATION: 5,   // 5 minutes

  // Maximum allowed durations
  MAX_STUDY_DURATION: 120,  // 2 hours
  MAX_BREAK_DURATION: 60,   // 1 hour

  // Minimum allowed durations
  MIN_STUDY_DURATION: 1,
  MIN_BREAK_DURATION: 1,

  // Quick preset options
  PRESETS: {
    CLASSIC_POMODORO: { study: 25, break: 5 },
    EXTENDED_FOCUS: { study: 45, break: 15 },
    QUICK_SPRINT: { study: 15, break: 3 },
    DEEP_WORK: { study: 60, break: 10 },
  },
} as const;

/**
 * Convert minutes to seconds
 */
export const minutesToSeconds = (minutes: number): number => minutes * 60;

/**
 * Convert seconds to minutes
 */
export const secondsToMinutes = (seconds: number): number => Math.floor(seconds / 60);
