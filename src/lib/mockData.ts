import { Course, Enrollment, Message, User, UserRole, CourseStatus, EnrollmentStatus, NotificationPreference } from "@/types";

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

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introducción a la Programación",
    description: "Aprende los fundamentos de la programación.",
    topic: "Programación",
    location: "Online",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-03-01"),
    capacity: 30,
    enrolled: 25,
    waitlist: 5,
    teacherId: "2",
    status: CourseStatus.ONGOING,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Marketing Digital Avanzado",
    description: "Estrategias avanzadas de marketing en línea.",
    topic: "Marketing",
    location: "Presencial",
    startDate: new Date("2024-03-15"),
    endDate: new Date("2024-04-15"),
    capacity: 20,
    enrolled: 18,
    waitlist: 2,
    teacherId: "2",
    status: CourseStatus.UPCOMING,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockEnrollments: Enrollment[] = [
  {
    id: "1",
    userId: "1",
    courseId: "1",
    status: EnrollmentStatus.ENROLLED,
    enrollmentDate: new Date("2024-01-15"),
    rating: 4,
    feedback: "Excelente curso, muy práctico",
  },
  {
    id: "2",
    userId: "3",
    courseId: "1",
    status: EnrollmentStatus.COMPLETED,
    enrollmentDate: new Date("2023-11-20"),
    rating: 5,
    feedback: "Muy completo y bien explicado",
  },
  {
    id: "3",
    userId: "2",
    courseId: "2",
    status: EnrollmentStatus.ENROLLED,
    enrollmentDate: new Date("2024-02-28"),
    rating: null,
    feedback: null,
  },
];

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

export const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "1",
    receiverId: "2",
    content: "Hola, ¿cómo estás?",
    read: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    senderId: "2",
    receiverId: "1",
    content: "¡Hola! Estoy bien, gracias. ¿Y tú?",
    read: true,
    createdAt: new Date(),
  },
];
