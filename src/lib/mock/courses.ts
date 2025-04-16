
import { Course, CourseStatus } from "@/types";

// The list of courses is now empty
export const mockCourses: Course[] = [];

export const courseService = {
  getCourses: (): Promise<Course[]> => {
    return new Promise((resolve) => {
      resolve(mockCourses);
    });
  },

  getCourseById: (courseId: string): Course | undefined => {
    return mockCourses.find(c => c.id === courseId);
  },
};
