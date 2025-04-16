
import { Course, CourseStatus, Enrollment, EnrollmentStatus, Message, NotificationPreference, User, UserRole } from "@/types";

// Helper to generate IDs
const generateId = (): string => Math.random().toString(36).substring(2, 10);

// Mock users data
export const users: User[] = [
  {
    id: "admin1",
    email: "admin@aulafacil.com",
    name: "Administrador",
    role: UserRole.ADMIN,
    notificationPreference: NotificationPreference.EMAIL,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "teacher1",
    email: "profesor@aulafacil.com",
    name: "Carlos Profesor",
    role: UserRole.TEACHER,
    notificationPreference: NotificationPreference.EMAIL,
    phone: "+34600111222",
    createdAt: new Date("2023-01-05"),
    updatedAt: new Date("2023-01-05"),
  },
  {
    id: "teacher2",
    email: "maria@aulafacil.com",
    name: "María Docente",
    role: UserRole.TEACHER,
    notificationPreference: NotificationPreference.WHATSAPP,
    phone: "+34600333444",
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10"),
  },
  {
    id: "user1",
    email: "usuario@ejemplo.com",
    name: "Usuario Ejemplo",
    role: UserRole.USER,
    notificationPreference: NotificationPreference.EMAIL,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "user2",
    email: "ana@ejemplo.com",
    name: "Ana Estudiante",
    role: UserRole.USER,
    notificationPreference: NotificationPreference.BOTH,
    phone: "+34600555666",
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-01-20"),
  },
];

// Mock courses data
export const courses: Course[] = [
  {
    id: "course1",
    title: "Introducción a la Programación",
    description: "Aprende los fundamentos de programación desde cero.",
    topic: "Programación",
    location: "Online",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-06-15"),
    capacity: 20,
    enrolled: 15,
    waitlist: 0,
    teacherId: "teacher1",
    status: CourseStatus.UPCOMING,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "course2",
    title: "Diseño UX/UI Avanzado",
    description: "Domina las técnicas avanzadas de diseño de experiencia de usuario.",
    topic: "Diseño",
    location: "Madrid",
    startDate: new Date("2024-04-10"),
    endDate: new Date("2024-05-20"),
    capacity: 15,
    enrolled: 15,
    waitlist: 3,
    teacherId: "teacher2",
    status: CourseStatus.ONGOING,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "course3",
    title: "Marketing Digital",
    description: "Estrategias efectivas para marketing en plataformas digitales.",
    topic: "Marketing",
    location: "Barcelona",
    startDate: new Date("2024-06-05"),
    endDate: new Date("2024-07-15"),
    capacity: 25,
    enrolled: 10,
    waitlist: 0,
    teacherId: "teacher2",
    status: CourseStatus.UPCOMING,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    id: "course4",
    title: "Ciencia de Datos con Python",
    description: "Aplica Python para análisis de datos y machine learning.",
    topic: "Programación",
    location: "Online",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-04-15"),
    capacity: 30,
    enrolled: 30,
    waitlist: 5,
    teacherId: "teacher1",
    status: CourseStatus.COMPLETED,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
];

// Mock enrollments data
export const enrollments: Enrollment[] = [
  {
    id: "enroll1",
    userId: "user1",
    courseId: "course1",
    status: EnrollmentStatus.ENROLLED,
    enrollmentDate: new Date("2024-03-10"),
  },
  {
    id: "enroll2",
    userId: "user2",
    courseId: "course1",
    status: EnrollmentStatus.ENROLLED,
    enrollmentDate: new Date("2024-03-15"),
  },
  {
    id: "enroll3",
    userId: "user1",
    courseId: "course2",
    status: EnrollmentStatus.WAITLISTED,
    enrollmentDate: new Date("2024-03-05"),
  },
  {
    id: "enroll4",
    userId: "user2",
    courseId: "course4",
    status: EnrollmentStatus.COMPLETED,
    enrollmentDate: new Date("2024-01-10"),
    rating: 4,
    feedback: "Excelente curso, muy completo.",
  },
];

// Mock messages data
export const messages: Message[] = [
  {
    id: "msg1",
    senderId: "user1",
    receiverId: "admin1",
    content: "Hola, tengo una consulta sobre el curso de programación.",
    read: true,
    createdAt: new Date("2024-03-20T10:30:00"),
  },
  {
    id: "msg2",
    senderId: "admin1",
    receiverId: "user1",
    content: "Claro, en qué puedo ayudarte?",
    read: true,
    createdAt: new Date("2024-03-20T10:35:00"),
  },
  {
    id: "msg3",
    senderId: "user2",
    receiverId: "teacher2",
    content: "¿Podría proporcionar más material sobre el tema de la última clase?",
    read: false,
    createdAt: new Date("2024-03-21T09:15:00"),
  },
];

// Mock service functions to simulate API calls
export const mockService = {
  // User related functions
  getUsers: () => Promise.resolve(users),
  getUserById: (id: string) => Promise.resolve(users.find(user => user.id === id)),
  
  // Course related functions
  getCourses: () => Promise.resolve(courses),
  getCourseById: (id: string) => Promise.resolve(courses.find(course => course.id === id)),
  getTeacherCourses: (teacherId: string) => Promise.resolve(courses.filter(course => course.teacherId === teacherId)),
  
  // Enrollment related functions
  getEnrollments: () => Promise.resolve(enrollments),
  getUserEnrollments: (userId: string) => Promise.resolve(enrollments.filter(enrollment => enrollment.userId === userId)),
  getCourseEnrollments: (courseId: string) => Promise.resolve(enrollments.filter(enrollment => enrollment.courseId === courseId)),
  
  // Message related functions
  getMessages: () => Promise.resolve(messages),
  getUserMessages: (userId: string) => Promise.resolve(
    messages.filter(message => message.senderId === userId || message.receiverId === userId)
  ),
  
  // Authentication functions (mock)
  login: (email: string, password: string) => {
    const user = users.find(u => u.email === email);
    // In a real system, you would check password here
    return Promise.resolve(user ? { success: true, user } : { success: false, message: "Invalid credentials" });
  },
  
  // Demo function to simulate enrolling in a course
  enrollInCourse: (userId: string, courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return Promise.resolve({ success: false, message: "Curso no encontrado" });
    }
    
    const existingEnrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (existingEnrollment) {
      return Promise.resolve({ success: false, message: "Ya estás inscrito en este curso" });
    }
    
    const newEnrollment: Enrollment = {
      id: generateId(),
      userId,
      courseId,
      status: course.enrolled < course.capacity ? EnrollmentStatus.ENROLLED : EnrollmentStatus.WAITLISTED,
      enrollmentDate: new Date()
    };
    
    enrollments.push(newEnrollment);
    
    if (newEnrollment.status === EnrollmentStatus.ENROLLED) {
      course.enrolled += 1;
    } else {
      course.waitlist += 1;
    }
    
    return Promise.resolve({ 
      success: true, 
      enrollment: newEnrollment,
      message: newEnrollment.status === EnrollmentStatus.ENROLLED 
        ? "Inscripción completada con éxito" 
        : "Inscrito en lista de espera"
    });
  },
  
  // Demo function to simulate cancelling an enrollment
  cancelEnrollment: (enrollmentId: string) => {
    const index = enrollments.findIndex(e => e.id === enrollmentId);
    if (index === -1) {
      return Promise.resolve({ success: false, message: "Inscripción no encontrada" });
    }
    
    const enrollment = enrollments[index];
    const course = courses.find(c => c.id === enrollment.courseId);
    
    if (!course) {
      return Promise.resolve({ success: false, message: "Curso no encontrado" });
    }
    
    // Update enrollment status to cancelled
    enrollment.status = EnrollmentStatus.CANCELLED;
    
    // Update course stats
    if (enrollment.status === EnrollmentStatus.ENROLLED) {
      course.enrolled -= 1;
      
      // Move someone from waitlist to enrolled if available
      const waitlistedEnrollment = enrollments.find(
        e => e.courseId === course.id && e.status === EnrollmentStatus.WAITLISTED
      );
      
      if (waitlistedEnrollment) {
        waitlistedEnrollment.status = EnrollmentStatus.ENROLLED;
        course.waitlist -= 1;
        course.enrolled += 1;
        // In a real system, you would send notification here
      }
    } else if (enrollment.status === EnrollmentStatus.WAITLISTED) {
      course.waitlist -= 1;
    }
    
    return Promise.resolve({ 
      success: true, 
      message: "Inscripción cancelada con éxito" 
    });
  },
  
  // Demo function to simulate rating a course
  rateCourse: (enrollmentId: string, rating: number, feedback?: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
      return Promise.resolve({ success: false, message: "Inscripción no encontrada" });
    }
    
    enrollment.rating = rating;
    if (feedback) {
      enrollment.feedback = feedback;
    }
    
    return Promise.resolve({ 
      success: true, 
      message: "Valoración registrada con éxito" 
    });
  },
};
