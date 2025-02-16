import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { publicCourses, courses } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface Course {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  maxParticipants: number;
  participants?: { _id: string; firstName: string; lastName: string; email: string; }[];
  participantCount?: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export function CourseCatalog() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await publicCourses.getAll();
        setCourseList(response.data.data.courses);
      } catch (err) {
        setError("Fehler beim Laden der Kurse");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/kurse/${courseId}` } });
      return;
    }

    try {
      await courses.join(courseId);
      // Refresh course list after enrollment
      const response = await publicCourses.getAll();
      setCourseList(response.data.data.courses);
    } catch (err) {
      console.error('Enrollment error:', err);
      setError("Fehler bei der Kursanmeldung");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lade Kurse...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Verfügbare Kurse
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Entdecken Sie unsere Physiotherapie-Kurse und melden Sie sich an
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseList.map((course) => (
            <Card key={course._id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Zeitraum:</span>
                    <span className="font-medium">
                      {formatDate(course.startDate)} - {formatDate(course.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{course.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Teilnehmer:</span>
                    <span className="font-medium">
                      {course.participantCount || 0} / {course.maxParticipants}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  asChild
                >
                  <Link to={`/kurse/${course._id}`}>Details</Link>
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleEnroll(course._id)}
                  disabled={course.participantCount === course.maxParticipants}
                >
                  {course.participantCount === course.maxParticipants 
                    ? "Ausgebucht" 
                    : isAuthenticated ? "Einschreiben" : "Anmelden & Einschreiben"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}