import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetails } from './pages/CourseDetails';
import { UserList } from './pages/UserList';
import { UserDetails } from './pages/UserDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminCourseManager } from './pages/admin/AdminCourseManager';
import { AdminUserManager } from './pages/admin/AdminUserManager';
import { useAuth } from './hooks/useAuth';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/kurse" element={<CourseCatalog />} />
          <Route path="/kurse/:id" element={<CourseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard and protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="kurse" element={<CourseCatalog />} />
            
            {/* Admin routes */}
            <Route path="admin">
              <Route path="kurse" element={
                <ProtectedRoute adminOnly>
                  <AdminCourseManager />
                </ProtectedRoute>
              } />
              <Route path="benutzer" element={
                <ProtectedRoute adminOnly>
                  <AdminUserManager />
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin-only list routes */}
            <Route path="teilnehmer" element={
              <ProtectedRoute adminOnly>
                <UserList />
              </ProtectedRoute>
            } />
            <Route path="teilnehmer/:id" element={
              <ProtectedRoute adminOnly>
                <UserDetails />
              </ProtectedRoute>
            } />
          </Route>

          {/* Redirect unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Dashboard home component
const DashboardHome = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Willkommen im Dashboard</h2>
        <p className="text-muted-foreground">
          Hier finden Sie eine Übersicht Ihrer Kurse und Aktivitäten
        </p>
      </div>

      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Kursverwaltung</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Erstellen und verwalten Sie Kurse
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/admin/kurse">Zur Kursverwaltung</Link>
            </Button>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Benutzerverwaltung</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Verwalten Sie Benutzerkonten
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/admin/benutzer">Zur Benutzerverwaltung</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
