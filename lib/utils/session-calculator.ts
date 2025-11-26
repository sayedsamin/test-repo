// Utility functions for calculating session dates based on course schedule

interface CourseSchedule {
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
}

/**
 * Calculate the next available session date based on course schedule
 * @param schedule - The course schedule array
 * @returns Date object representing the next session, or null if no schedule
 */
export function calculateNextSessionDate(schedule: CourseSchedule[] | null | undefined): Date | null {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  const now = new Date();
  const firstSchedule = schedule[0]; // Use first schedule slot
  
  // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // Get the target days as numbers
  const targetDays = firstSchedule.days.map(day => dayMap[day.toLowerCase()]);
  
  // Find the next occurrence of any of the scheduled days
  let nextDate = new Date(now);
  let daysChecked = 0;
  
  while (daysChecked < 14) { // Check next 2 weeks
    const currentDay = nextDate.getDay();
    
    if (targetDays.includes(currentDay)) {
      // Set the time based on schedule
      const [hours, minutes] = firstSchedule.startTime.split(':').map(Number);
      nextDate.setHours(hours, minutes, 0, 0);
      
      // If this time has already passed today, continue to next occurrence
      if (nextDate > now) {
        return nextDate;
      }
    }
    
    // Move to next day
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0, 0, 0, 0);
    daysChecked++;
  }
  
  return null;
}

/**
 * Check if a session has occurred (is in the past) based on course schedule
 * @param schedule - The course schedule array
 * @param originalSessionDate - The original booking session date (fallback)
 * @returns boolean indicating if session has passed
 */
export function hasSessionOccurred(
  schedule: CourseSchedule[] | null | undefined,
  originalSessionDate: Date
): boolean {
  const nextSession = calculateNextSessionDate(schedule);
  
  // If we can calculate a next session, check if it's after the original
  // This means the original session has passed
  if (nextSession) {
    return nextSession > originalSessionDate;
  }
  
  // Fallback to original session date if no schedule
  const now = new Date();
  return originalSessionDate < now;
}
