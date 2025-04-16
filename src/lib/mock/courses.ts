
import { Course, CourseStatus } from "@/types";

// Adding some example courses with dates
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introducción al Liderazgo",
    description: "Curso básico para desarrollar habilidades de liderazgo efectivo en el entorno empresarial.",
    topic: "Liderazgo",
    location: "Sala de Conferencias A",
    startDate: new Date(2025, 4, 20, 9, 0), // May 20, 2025, 9:00 AM
    endDate: new Date(2025, 4, 20, 17, 0),  // May 20, 2025, 5:00 PM
    capacity: 25,
    enrolled: 18,
    waitlist: 0,
    status: CourseStatus.UPCOMING,
    instructor: "Maria González",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "2",
    title: "Gestión del Tiempo",
    description: "Aprende estrategias efectivas para maximizar tu productividad y equilibrar tus responsabilidades.",
    topic: "Productividad",
    location: "Sala de Formación B",
    startDate: new Date(2025, 4, 25, 10, 0), // May 25, 2025, 10:00 AM
    endDate: new Date(2025, 4, 25, 16, 0),   // May 25, 2025, 4:00 PM
    capacity: 20,
    enrolled: 20,
    waitlist: 3,
    status: CourseStatus.UPCOMING,
    instructor: "Javier Martínez",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "3",
    title: "Comunicación Efectiva",
    description: "Mejora tus habilidades de comunicación para lograr un mejor entendimiento en el entorno laboral.",
    topic: "Comunicación",
    location: "Sala Virtual",
    startDate: new Date(2025, 5, 5, 14, 0),  // June 5, 2025, 2:00 PM
    endDate: new Date(2025, 5, 5, 18, 0),    // June 5, 2025, 6:00 PM
    capacity: 30,
    enrolled: 12,
    waitlist: 0,
    status: CourseStatus.UPCOMING,
    instructor: "Ana Rodríguez",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "4",
    title: "Innovación y Pensamiento Creativo",
    description: "Desarrollo de técnicas para fomentar la creatividad y la innovación en el ámbito empresarial.",
    topic: "Innovación",
    location: "Sala de Conferencias C",
    startDate: new Date(2025, 5, 12, 9, 30),  // June 12, 2025, 9:30 AM
    endDate: new Date(2025, 5, 13, 16, 30),   // June 13, 2025, 4:30 PM
    capacity: 15,
    enrolled: 8,
    waitlist: 0,
    status: CourseStatus.UPCOMING,
    instructor: "Carlos Sánchez",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "5",
    title: "Gestión de Equipos Remotos",
    description: "Estrategias para gestionar equipos en entornos de trabajo remoto y mantener la productividad.",
    topic: "Gestión",
    location: "Sala Virtual",
    startDate: new Date(2025, 5, 18, 10, 0),  // June 18, 2025, 10:00 AM
    endDate: new Date(2025, 5, 18, 17, 0),    // June 18, 2025, 5:00 PM
    capacity: 25,
    enrolled: 22,
    waitlist: 0,
    status: CourseStatus.UPCOMING,
    instructor: "Laura Fernández",
    imageUrl: "/placeholder.svg",
  },
];

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
