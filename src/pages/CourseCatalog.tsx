import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { courses, type CourseData } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export function CourseCatalog() {
  const { isAuthenticated } = useAuth();
  const [courseList, setCourseList] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Hole nur die eigenen Kurse
        const response = await courses.getMyCourses();
        setCourseList(response.data.data.courses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Fehler beim Laden der Kurse');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Lade Kurse...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meine Kurse</h1>
      </div>

      {courseList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            Sie sind noch in keinem Kurs eingeschrieben.
          </p>
          {isAuthenticated && (
            <Button asChild>
              <Link to="/dashboard">Verfügbare Kurse ansehen</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseList.map((course) => (
            <Card key={course._id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zeitraum:</span>
                    <span>
                      {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{course.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Teilnehmer:</span>
                    <span>
                      {course.participantCount || 0} / {course.maxParticipants}
                    </span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/kurse/${course._id}`}>Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}