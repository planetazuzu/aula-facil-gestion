
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { CourseProvider } from "@/contexts/CourseContext";
import { CourseSearch } from "@/components/courses/CourseSearch";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseList } from "@/components/courses/CourseList";
import { WaitlistNotification } from "@/components/courses/WaitlistNotification";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";

// Component to manage the course listing view with filters and search
function CourseContent() {
  const [showFilters, setShowFilters] = useState(false);
  const { enrollments, topics, locations, handleFilterChange } = useCourses();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Cursos disponibles</h1>
        <p className="text-muted-foreground">
          Explora nuestra amplia selección de cursos y encuentra el que mejor se adapte a tus
          intereses y necesidades.
        </p>
      </div>

      <div className="mb-6">
        <CourseSearch 
          onToggleFilters={() => setShowFilters(!showFilters)} 
          showFilters={showFilters} 
        />

        {showFilters && (
          <CourseFilters 
            onFilter={handleFilterChange} 
            topics={topics} 
            locations={locations} 
          />
        )}
      </div>

      {user && <WaitlistNotification enrollments={enrollments} />}

      <CourseList />
    </div>
  );
}

// Main Courses page component
export default function Courses() {
  return (
    <Layout>
      <CourseProvider>
        <CourseContent />
      </CourseProvider>
    </Layout>
  );
}
