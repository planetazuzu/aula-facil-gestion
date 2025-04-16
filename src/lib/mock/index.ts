
import { userService } from "./users";
import { courseService } from "./courses";
import { enrollmentService } from "./enrollments";
import { ratingService } from "./ratings";
import { messageService } from "./messages";

export const mockService = {
  // User service methods
  login: userService.login,
  getUserById: userService.getUserById,
  getTotalUserCount: userService.getTotalUserCount,
  
  // Course service methods
  getCourses: courseService.getCourses,
  getCourseById: courseService.getCourseById,
  
  // Enrollment service methods
  getEnrollmentsByUserId: enrollmentService.getEnrollmentsByUserId,
  getCourseWaitlist: enrollmentService.getCourseWaitlist,
  enrollUserInCourse: enrollmentService.enrollUserInCourse,
  cancelEnrollment: enrollmentService.cancelEnrollment,
  
  // Rating service methods
  rateCourse: ratingService.rateCourse,
  getCourseRatings: ratingService.getCourseRatings,
  getUserCourseRating: ratingService.getUserCourseRating,
  
  // Message service methods
  createMessage: messageService.createMessage,
};

// Fix the CourseFilters.tsx error by making sure we're exporting the arrays
export { mockUsers } from "./users";
export { mockCourses } from "./courses";
export { mockEnrollments } from "./enrollments";
export { mockRatings } from "./ratings";
export { mockMessages } from "./messages";
