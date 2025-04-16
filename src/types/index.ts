export enum UserRole {
  USER = "USER",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN"
}

export enum NotificationPreference {
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  BOTH = "BOTH",
  NONE = "NONE"
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  notificationPreference: NotificationPreference;
  createdAt: Date;
  updatedAt: Date;
};

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
  status: CourseStatus;
  instructor?: string;
  imageUrl?: string;
  averageRating?: number;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  completionDate?: Date;
};

export type CourseRating = {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type CourseFilter = {
  topic?: string;
  location?: string;
  startDate?: string;
  status?: CourseStatus;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
};
