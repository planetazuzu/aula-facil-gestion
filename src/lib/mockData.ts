import { User, UserRole, NotificationPreference, Message } from "@/types";
import { Course, Enrollment, CourseStatus, EnrollmentStatus, CourseRating } from "@/types";

type LoginResult = {
  success: boolean;
  user?: User;
  message?: string;
};

export const mockService = {
  login: (email: string, password: string): Promise<LoginResult> => {
    return new Promise((resolve) => {
      const user = mockUsers.find(u => u.email === email);
      
      if (user && password === 'password') {
        resolve({
          success: true,
          user: user,
        });
      } else {
        resolve({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }
    });
  },

  getUserById: (id: string): User | undefined => {
    return mockUsers.find(u => u.id === id);
  },
  
  getTotalUserCount: (): number => {
    return 350; // Número fijo de usuarios para mostrar en el dashboard
  },

  getCourses: (): Promise<Course[]> => {
    return new Promise((resolve) => {
      resolve(mockCourses);
    });
  },

  getCourseById: (courseId: string): Course | undefined => {
    return mockCourses.find(c => c.id === courseId);
  },

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

  enrollUserInCourse: (userId: string, courseId: string): Promise<{ success: boolean; enrolled: boolean; waitlisted: boolean; message: string }> => {
    return new Promise((resolve) => {
      const result = enrollUser(userId, courseId);
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

  cancelEnrollment: (userId: string, courseId: string): Promise<{ success: boolean; message: string }> => {
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
          
          const nextInWaitlist = getNextWaitlistedUser(courseId);
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

  createMessage: (senderId: string, receiverId: string, content: string): Message => {
    const newMessage: Message = {
      id: String(mockMessages.length + 1),
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date(),
    };

    mockMessages.push(newMessage);
    return newMessage;
  },
  
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

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: UserRole.ADMIN,
    notificationPreference: NotificationPreference.EMAIL,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "teacher@example.com",
    name: "Teacher User",
    role: UserRole.TEACHER,
    notificationPreference: NotificationPreference.WHATSAPP,
    phone: "+1234567890",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    email: "student@example.com",
    name: "Student User",
    role: UserRole.USER,
    notificationPreference: NotificationPreference.BOTH,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// The list of courses is now empty
export const mockCourses: Course[] = [];

export const mockEnrollments: Enrollment[] = [];

// New mock ratings array
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

export const getNextWaitlistedUser = (courseId: string): string | null => {
  const waitlistedEnrollments = mockEnrollments
    .filter(enrollment => 
      enrollment.courseId === courseId && 
      enrollment.status === EnrollmentStatus.WAITLISTED
    )
    .sort((a, b) => a.enrollmentDate.getTime() - b.enrollmentDate.getTime());

  return waitlistedEnrollments.length > 0 ? waitlistedEnrollments[0].userId : null;
};

export const enrollUser = (userId: string, courseId: string): boolean => {
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
};

export const mockMessages: Message[] = [];
