import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { publicCourses, courses, type CourseData } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        const response = await publicCourses.getById(id);
        setCourse(response.data.data.course);
      } catch (err) {
        setError("Fehler beim Laden des Kurses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleJoinCourse = async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      await courses.join(id);
      // Kurs neu laden um Teilnehmerliste zu aktualisieren
      const response = await publicCourses.getById(id);
      setCourse(response.data.data.course);
    } catch (err) {
      setError("Fehler beim Beitreten des Kurses");
      console.error(err);
    }
  };

  const formatParticipantName = (firstName: string, lastName: string) => {
    if (isAdmin) {
      return `${firstName} ${lastName}`;
    }
    // Nur erste Buchstaben des Vor- und Nachnamens
    return `${firstName.charAt(0)}. ${lastName.charAt(0)}.`;
  };

  if (loading) {
    return <div className="text-center py-12">Lade Kurs...</div>;
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Kurs nicht gefunden"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Zurück
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kursdetails</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Zurück
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Beschreibung</p>
              <p>{course.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zeitraum</p>
                <p>{new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="capitalize">{course.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kategorie</p>
                <p>{course.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teilnehmer</p>
                <p>{course.participantCount || 0} / {course.maxParticipants}</p>
              </div>
            </div>

            {isAuthenticated && (
              <Button 
                className="w-full mt-4"
                onClick={handleJoinCourse}
              >
                Kurs beitreten
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {course.participants && course.participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teilnehmer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {course.participants.map((participant) => (
                <div 
                  key={participant._id}
                  className="flex items-center justify-between py-2"
                >
                  <span>
                    {formatParticipantName(participant.firstName, participant.lastName)}
                  </span>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/teilnehmer/${participant._id}`)}>
                      Details
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}