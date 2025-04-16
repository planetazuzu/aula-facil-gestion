
import { useMemo, useState } from "react";
import { format, isToday, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/lib/mock";
import { Course } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "day">("month");
  
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: mockService.getCourses,
  });

  // Get events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    if (view === "day") {
      return courses.filter((course) => {
        const courseDate = new Date(course.startDate);
        return (
          courseDate.getDate() === date.getDate() &&
          courseDate.getMonth() === date.getMonth() &&
          courseDate.getFullYear() === date.getFullYear()
        );
      });
    }
    return [];
  }, [date, courses, view]);

  // Generate calendar days with course indicators
  const daysWithEvents = useMemo(() => {
    const days = new Map<string, Course[]>();
    
    courses.forEach((course) => {
      const dateStr = format(new Date(course.startDate), "yyyy-MM-dd");
      
      if (!days.has(dateStr)) {
        days.set(dateStr, []);
      }
      
      days.get(dateStr)?.push(course);
    });
    
    return days;
  }, [courses]);

  // Switch to previous month or day
  const handlePrevious = () => {
    const newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setDate(newDate);
  };

  // Switch to next month or day
  const handleNext = () => {
    const newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setDate(newDate);
  };

  // Switch to today
  const handleToday = () => {
    setDate(new Date());
  };

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Calendario de Formación</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {view === "month" ? "Vista Mensual" : "Vista Diaria"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setView("month")}>
                    Vista Mensual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView("day")}>
                    Vista Diaria
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    className="rounded-md border pointer-events-auto"
                    modifiers={{
                      today: (day) => isToday(day),
                      withEvents: (day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        return daysWithEvents.has(dateStr);
                      }
                    }}
                    modifiersClassNames={{
                      today: "bg-primary text-primary-foreground",
                      withEvents: "font-bold text-primary relative before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:rounded-full before:bg-primary"
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Hoy
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-lg font-semibold">
              {view === "month" 
                ? format(date, "MMMM yyyy", { locale: es }) 
                : format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </div>
          </div>

          {view === "month" ? (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-1">
                  {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                    <div 
                      key={day} 
                      className="text-center font-medium py-2 text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: 35 }).map((_, i) => {
                    const d = new Date(date.getFullYear(), date.getMonth(), 1);
                    
                    // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
                    let day = d.getDay();
                    day = day === 0 ? 7 : day; // Convert Sunday (0) to 7
                    
                    // Adjust the start day to account for Monday as the first day of the week
                    const start = 2 - day;
                    
                    // Calculate the current date to display
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), start + i);
                    
                    // Format the date for lookup
                    const dateStr = format(currentDate, "yyyy-MM-dd");
                    
                    // Get events for this date
                    const dayEvents = daysWithEvents.get(dateStr) || [];
                    
                    // Check if this date is from the current month
                    const isCurrentMonth = currentDate.getMonth() === date.getMonth();
                    
                    return (
                      <div
                        key={i}
                        className={cn(
                          "min-h-[100px] p-2 border border-border rounded-md transition-colors",
                          isCurrentMonth ? "bg-background" : "bg-muted/20 text-muted-foreground",
                          isToday(currentDate) && "border-primary",
                          isWeekend(currentDate) && "bg-muted/10"
                        )}
                        onClick={() => {
                          setDate(currentDate);
                          if (dayEvents.length > 0) {
                            setView("day");
                          }
                        }}
                      >
                        <div className="text-right text-sm">{currentDate.getDate()}</div>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary cursor-pointer"
                              title={event.title}
                            >
                              {format(new Date(event.startDate), "HH:mm")} - {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              {dayEvents.length - 2} más...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                  </CardTitle>
                  <CardDescription>
                    {eventsForSelectedDate.length 
                      ? `${eventsForSelectedDate.length} cursos programados` 
                      : "No hay cursos programados para este día"}
                  </CardDescription>
                </CardHeader>
              </Card>

              {eventsForSelectedDate.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/20 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                        </CardDescription>
                      </div>
                      <Badge variant={event.status === "UPCOMING" ? "outline" : "default"}>
                        {event.status === "UPCOMING" ? "Próximo" : event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Instructor</p>
                        <p className="text-sm">{event.instructor || "Por determinar"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Ubicación</p>
                        <p className="text-sm">{event.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Plazas</p>
                        <p className="text-sm">{event.enrolled}/{event.capacity} ocupadas</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Lista de espera</p>
                        <p className="text-sm">{event.waitlist} personas</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-1">Descripción</p>
                      <p className="text-sm">{event.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
