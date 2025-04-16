
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { mockService } from "@/lib/mock"; // Updated import
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, ThumbsUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RatingStars } from "@/components/courses/RatingStars";

export default function CourseRating() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const course = mockService.getCourseById(courseId || "");

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Curso no encontrado. Por favor, regresa a la lista de cursos.
              </p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate("/courses")}>Volver a cursos</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!user || !courseId) return;
    
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una valoración antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        mockService.rateCourse(courseId, user.id, rating, comment);
        
        setSubmitted(true);
        toast({
          title: "¡Gracias por tu valoración!",
          description: "Tu opinión ayuda a mejorar nuestros cursos.",
        });
      }, 1000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la valoración. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center">¡Valoración enviada!</CardTitle>
              <CardDescription className="text-center">
                Gracias por compartir tu opinión sobre el curso
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <ThumbsUp className="h-16 w-16 text-green-500 mb-6" />
              <p className="text-center mb-2">Has valorado este curso con {rating} estrellas</p>
              <RatingStars rating={rating} readOnly />
              
              {comment && (
                <div className="mt-6 bg-muted p-4 rounded-md w-full">
                  <p className="text-sm font-medium mb-2">Tu comentario:</p>
                  <p className="text-sm italic">"{comment}"</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex justify-center w-full">
                <Button onClick={() => navigate("/courses")}>Volver a cursos</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Valorar curso</h1>
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>Comparte tu experiencia con este curso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">¿Cómo valorarías este curso?</p>
              <RatingStars rating={rating} onChange={setRating} />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Comentarios (opcional)</p>
              <Textarea
                placeholder="Comparte tu experiencia, lo que te gustó o las áreas de mejora..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar valoración
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
