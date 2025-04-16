
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER"
}

export enum NotificationPreference {
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  BOTH = "BOTH"
}

export enum CourseStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum EnrollmentStatus {
  ENROLLED = "ENROLLED",
  WAITLISTED = "WAITLISTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  notificationPreference: NotificationPreference;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  topic: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolled: number;
  waitlist: number;
  teacherId: string;
  teacher?: User;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  rating?: number;
  feedback?: string;
  user?: User;
  course?: Course;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  sender?: User;
  receiver?: User;
};

export type CourseFilter = {
  topic?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: CourseStatus;
};
