import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { auth } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { AxiosError } from "axios";

export function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect wenn bereits eingeloggt
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validierung
    if (data.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      const response = await auth.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      });

      // Automatisch einloggen nach der Registrierung
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // Zum Dashboard weiterleiten
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof AxiosError) {
        // API-spezifische Fehlermeldungen
        setError(err.response?.data?.message || 'Registrierung fehlgeschlagen');
        
        // Logging für Debugging
        if (err.response) {
          console.log('Error response:', {
            status: err.response.status,
            data: err.response.data
          });
        } else if (err.request) {
          console.log('Error request:', err.request);
          setError('Verbindung zum Server fehlgeschlagen');
        }
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Registrieren</CardTitle>
              <CardDescription>
                Erstellen Sie einen Account um an Kursen teilzunehmen
              </CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/">← Zurück</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  value={data.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  value={data.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mail@beispiel.de"
                required
                value={data.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={data.password}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Mindestens 6 Zeichen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort wiederholen</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={data.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Registrierung läuft..." : "Registrieren"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Bereits registriert?{' '}
                <Button variant="link" className="px-0" asChild>
                  <Link to="/login">Anmelden</Link>
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}