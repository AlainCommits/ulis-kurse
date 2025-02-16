import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { users, type UserData, type CourseData } from "../services/api";

interface UserResponse {
  user: UserData;
  courses: CourseData[];
}

export function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        const response = await users.getById(id);
        setUserData(response.data.data);
      } catch (err) {
        setError("Fehler beim Laden der Daten");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12">Lade Daten...</div>;
  }

  if (error || !userData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Teilnehmer nicht gefunden"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Zurück
        </Button>
      </div>
    );
  }

  const { user, courses } = userData;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teilnehmer Details</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Zurück
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user.firstName} {user.lastName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rolle</p>
              <p className="capitalize">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gebuchte Kurse</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map(course => (
                <Card key={course._id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/kurse/${course._id}`)}>
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Keine Kurse gebucht.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}