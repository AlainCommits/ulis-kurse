import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

export function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Zeige Ladeindikator während der Auth-Status geprüft wird
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Lade...</p>
      </div>
    );
  }

  // Redirect zu Login wenn nicht authentifiziert
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}