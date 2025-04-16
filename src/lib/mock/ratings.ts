
import { mockCourses } from "./courses";
import { CourseRating } from "@/types";

export const mockRatings: CourseRating[] = [];

// Helper function to update course average rating
const updateCourseAverageRating = (courseId: string) => {
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) return;
  
  const courseRatings = mockRatings.filter(r => r.courseId === courseId);
  if (courseRatings.length === 0) {
    course.averageRating = 0;
    return;
  }
  
  const sum = courseRatings.reduce((acc, r) => acc + r.rating, 0);
  course.averageRating = Number((sum / courseRatings.length).toFixed(1));
};

export const ratingService = {
  // New function for course ratings
  rateCourse: (courseId: string, userId: string, rating: number, comment: string): CourseRating => {
    const newRating: CourseRating = {
      id: String(mockRatings.length + 1),
      courseId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };
    
    mockRatings.push(newRating);
    
    // Update course average rating
    updateCourseAverageRating(courseId);
    
    return newRating;
  },
  
  // Get ratings for a course
  getCourseRatings: (courseId: string): Promise<CourseRating[]> => {
    return new Promise((resolve) => {
      resolve(mockRatings.filter(r => r.courseId === courseId));
    });
  },
  
  // Get user's rating for a course
  getUserCourseRating: (userId: string, courseId: string): CourseRating | undefined => {
    return mockRatings.find(r => r.userId === userId && r.courseId === courseId);
  },
};
