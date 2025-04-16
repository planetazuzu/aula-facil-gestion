
import { mockCourses } from "./courses";
import { Enrollment, EnrollmentStatus } from "@/types";
import { EnrollmentResult, CancellationResult } from "./types";

export const mockEnrollments: Enrollment[] = [];

export const enrollmentService = {
  getEnrollmentsByUserId: (userId: string): Promise<Enrollment[]> => {
    return new Promise((resolve) => {
      resolve(mockEnrollments.filter(e => e.userId === userId));
    });
  },

  getCourseWaitlist: (courseId: string): Promise<Enrollment[]> => {
    return new Promise((resolve) => {
      resolve(
        mockEnrollments.filter(
          e => e.courseId === courseId && e.status === EnrollmentStatus.WAITLISTED
        ).sort((a, b) => a.enrollmentDate.getTime() - b.enrollmentDate.getTime())
      );
    });
  },

  getNextWaitlistedUser: (courseId: string): string | null => {
    const waitlistedEnrollments = mockEnrollments
      .filter(enrollment => 
        enrollment.courseId === courseId && 
        enrollment.status === EnrollmentStatus.WAITLISTED
      )
      .sort((a, b) => a.enrollmentDate.getTime() - b.enrollmentDate.getTime());
  
    return waitlistedEnrollments.length > 0 ? waitlistedEnrollments[0].userId : null;
  },
  
  enrollUser: (userId: string, courseId: string): boolean => {
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) return false;
  
    const existingEnrollment = mockEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );
  
    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.ENROLLED) {
        return false;
      }
      existingEnrollment.status = EnrollmentStatus.ENROLLED;
      return true;
    }
  
    if (course.enrolled < course.capacity) {
      mockEnrollments.push({
        id: String(mockEnrollments.length + 1),
        userId,
        courseId,
        status: EnrollmentStatus.ENROLLED,
        enrollmentDate: new Date(),
      });
      course.enrolled++;
      return true;
    }
  
    mockEnrollments.push({
      id: String(mockEnrollments.length + 1),
      userId,
      courseId,
      status: EnrollmentStatus.WAITLISTED,
      enrollmentDate: new Date(),
    });
    course.waitlist++;
    return false;
  },

  enrollUserInCourse: (userId: string, courseId: string): Promise<EnrollmentResult> => {
    return new Promise((resolve) => {
      const result = enrollmentService.enrollUser(userId, courseId);
      const course = mockCourses.find(c => c.id === courseId);
      
      if (!course) {
        resolve({ 
          success: false, 
          enrolled: false, 
          waitlisted: false, 
          message: "Curso no encontrado" 
        });
        return;
      }
      
      const enrollment = mockEnrollments.find(
        e => e.userId === userId && e.courseId === courseId
      );
      
      if (enrollment) {
        if (enrollment.status === EnrollmentStatus.ENROLLED) {
          resolve({ 
            success: true, 
            enrolled: true, 
            waitlisted: false, 
            message: "Ya estás inscrito en este curso" 
          });
        } else if (enrollment.status === EnrollmentStatus.WAITLISTED) {
          resolve({ 
            success: true, 
            enrolled: false, 
            waitlisted: true, 
            message: "Has sido añadido a la lista de espera" 
          });
        }
      } else if (result) {
        resolve({ 
          success: true, 
          enrolled: true, 
          waitlisted: false, 
          message: "Te has inscrito correctamente" 
        });
      } else {
        resolve({ 
          success: true, 
          enrolled: false, 
          waitlisted: true, 
          message: "Has sido añadido a la lista de espera" 
        });
      }
    });
  },

  cancelEnrollment: (userId: string, courseId: string): Promise<CancellationResult> => {
    return new Promise((resolve) => {
      const enrollment = mockEnrollments.find(
        e => e.userId === userId && e.courseId === courseId
      );
      
      if (!enrollment) {
        resolve({ success: false, message: "No estás inscrito en este curso" });
        return;
      }
      
      const wasEnrolled = enrollment.status === EnrollmentStatus.ENROLLED;
      
      enrollment.status = EnrollmentStatus.CANCELLED;
      
      const course = mockCourses.find(c => c.id === courseId);
      if (course) {
        if (wasEnrolled) {
          course.enrolled--;
          
          const nextInWaitlist = enrollmentService.getNextWaitlistedUser(courseId);
          if (nextInWaitlist) {
            const waitlistedEnrollment = mockEnrollments.find(
              e => e.userId === nextInWaitlist && e.courseId === courseId
            );
            if (waitlistedEnrollment) {
              waitlistedEnrollment.status = EnrollmentStatus.ENROLLED;
              course.waitlist--;
              course.enrolled++;
            }
          }
          
          resolve({ 
            success: true, 
            message: "Inscripción cancelada correctamente" 
          });
        } else {
          course.waitlist--;
          resolve({ 
            success: true, 
            message: "Has salido de la lista de espera" 
          });
        }
      } else {
        resolve({ success: false, message: "Curso no encontrado" });
      }
    });
  },
};
