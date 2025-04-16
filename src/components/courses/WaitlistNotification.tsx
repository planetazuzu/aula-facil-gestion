
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Enrollment, EnrollmentStatus } from "@/types";

interface WaitlistNotificationProps {
  enrollments: Enrollment[];
}

export function WaitlistNotification({ enrollments }: WaitlistNotificationProps) {
  const hasWaitlistedCourses = enrollments.some(e => e.status === EnrollmentStatus.WAITLISTED);

  if (!hasWaitlistedCourses) {
    return null;
  }

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
        <Clock className="h-5 w-5 mr-2" />
        Tienes cursos en lista de espera
      </h2>
      <p className="text-amber-700 mb-3">
        Estás en lista de espera para algunos cursos. Te notificaremos cuando haya plazas disponibles.
      </p>
      <Button asChild variant="outline" className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100">
        <Link to="/waitlist">Ver mi lista de espera</Link>
      </Button>
    </div>
  );
}
