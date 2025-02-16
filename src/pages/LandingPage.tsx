import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Link } from "react-router-dom";
import { publicCourses, type CourseData } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { AxiosError } from "axios";
import { Navbar } from "@/components/Navbar";

export function LandingPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin, user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await publicCourses.getAll();
        console.log('API Response:', response.data);
        setCourses(response.data.data.courses);
      } catch (err) {
        console.error('Error details:', err);
        if (err instanceof AxiosError) {
          setError(`Fehler beim Laden der Kurse: ${err.message}`);
          if (err.response) {
            console.log('Error response:', {
              status: err.response.status,
              headers: err.response.headers,
              data: err.response.data
            });
          }
        } else {
          setError("Unbekannter Fehler beim Laden der Kurse");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Willkommen bei Ulis Physiotherapie-Kursen
          {user && `, ${user.firstName}`}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Vertiefen Sie Ihr Fachwissen in der Physiotherapie mit unseren spezialisierten Kursen
        </p>
        {!isAuthenticated && (
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link to="/register">Jetzt registrieren</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Anmelden</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Course List Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Aktuelle Kurse
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Lade Kurse...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-500 mb-4">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Erneut versuchen
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                Aktuell sind keine Kurse verfügbar.
              </p>
              {isAdmin && (
                <Button asChild>
                  <Link to="/dashboard/admin/kurse">Kurs erstellen</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
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
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/kurse/${course._id}`}>Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}