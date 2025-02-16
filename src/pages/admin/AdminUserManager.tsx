import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { admin, type UserData } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export function AdminUserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await admin.getAllUsers();
      setUsers(response.data.data.users);
    } catch (err) {
      setError("Fehler beim Laden der Benutzer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    // Verhindern, dass der Admin sich selbst die Rechte entzieht
    if (userId === currentUser?._id && newRole !== 'admin') {
      setError("Sie können sich nicht selbst die Admin-Rechte entziehen");
      return;
    }

    try {
      await admin.updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Fehler beim Ändern der Benutzerrolle");
    }
  };

  const handleDelete = async (userId: string) => {
    // Verhindern, dass der Admin sich selbst löscht
    if (userId === currentUser?._id) {
      setError("Sie können nicht Ihr eigenes Konto löschen");
      return;
    }

    if (!window.confirm("Möchten Sie diesen Benutzer wirklich löschen?")) {
      return;
    }

    try {
      await admin.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Fehler beim Löschen des Benutzers");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Lade Benutzer...</div>;
  }

  return (
    <div className="mt-8 md:mt-0 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Benutzerverwaltung</h1>
      </div>
  
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}
  
      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user._id} className="py-4 sm:p-6">
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">
                    {user.firstName} {user.lastName}
                    {user._id === currentUser?._id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Das sind Sie
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm">
                    Rolle:{' '}
                    <span className={user.role === 'admin' ? 'text-primary font-medium' : 'text-gray-700'}>
                      {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                    </span>
                  </p>
                </div>
  
                {user._id !== currentUser?._id && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                    >
                      {user.role === 'admin' ? 'Zu Benutzer machen' : 'Zum Admin machen'}
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                    >
                      Löschen
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
  
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Keine Benutzer gefunden</p>
        </div>
      )}
    </div>
  );
}  