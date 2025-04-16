
import { User, UserRole, NotificationPreference, Message } from "@/types";
import { Course, Enrollment, CourseStatus, EnrollmentStatus, CourseRating } from "@/types";

export type LoginResult = {
  success: boolean;
  user?: User;
  message?: string;
};

export type EnrollmentResult = { 
  success: boolean; 
  enrolled: boolean; 
  waitlisted: boolean; 
  message: string 
};

export type CancellationResult = { 
  success: boolean; 
  message: string 
};
