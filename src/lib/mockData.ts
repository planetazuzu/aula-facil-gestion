
// This file is maintained for backward compatibility
// Please use the more modular imports from @/lib/mock instead
import { mockService } from "./mock";
import { userService } from "./mock/users";
import { mockUsers } from "./mock/users";
import { mockCourses } from "./mock/courses";
import { mockEnrollments } from "./mock/enrollments";
import { mockRatings } from "./mock/ratings";
import { mockMessages } from "./mock/messages";

export { 
  mockService, 
  userService, // Export userService directly
  mockUsers, 
  mockCourses, 
  mockEnrollments, 
  mockRatings, 
  mockMessages
};

// Re-export all the helper functions that were previously in this file
export const getNextWaitlistedUser = mockService.getCourseWaitlist;
export const enrollUser = mockService.enrollUserInCourse;
