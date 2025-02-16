import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Link, Navigate } from "react-router-dom";
import { admin, type UserData } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export function UserList() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect wenn kein Admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await admin.getAllUsers();
      console.log('Users response:', response.data);  // Debug-Log
      setUsers(response.data.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);  // Debug-Log
      setError("Fehler beim Laden der Teilnehmer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Lade Teilnehmer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchUsers();
            }}
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teilnehmerliste</h1>
      </div>

      <div className="grid gap-6">
        {users.map((user) => (
          <Card key={user._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <span>{user.firstName} {user.lastName}</span>
                  {user.role === 'admin' && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Administrator
                    </span>
                  )}
                </div>
                <Button variant="outline" asChild>
                  <Link to={`/dashboard/teilnehmer/${user._id}`}>Details</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-sm">
                  Rolle: <span className="capitalize">{user.role}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Keine Teilnehmer gefunden
          </p>
        </div>
      )}
    </div>
  );
}