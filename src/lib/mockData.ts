
// This file is maintained for backward compatibility
// Please use the more modular imports from @/lib/mock instead
import { mockService, mockUsers, mockCourses, mockEnrollments, mockRatings, mockMessages } from "./mock";

export { 
  mockService, 
  mockUsers, 
  mockCourses, 
  mockEnrollments, 
  mockRatings, 
  mockMessages
};

// Re-export all the helper functions that were previously in this file
export const getNextWaitlistedUser = mockService.getCourseWaitlist;
export const enrollUser = mockService.enrollUserInCourse;
