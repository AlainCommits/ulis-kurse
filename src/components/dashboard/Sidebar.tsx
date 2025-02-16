import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import {
  Home,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Schließe Sidebar bei Routenwechsel auf Mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  // Navigation Items basierend auf Benutzerrolle
  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard", adminOnly: false },
    { to: "/dashboard/kurse", icon: BookOpen, label: "Meine Kurse", adminOnly: false },
    { to: "/dashboard/admin/kurse", icon: Settings, label: "Kursverwaltung", adminOnly: true },
    { to: "/dashboard/admin/benutzer", icon: Settings, label: "Benutzerverwaltung", adminOnly: true },
    { to: "/dashboard/teilnehmer", icon: Users, label: "Teilnehmerliste", adminOnly: true },
    { to: "/", icon: Home, label: "Startseite", adminOnly: false },

  ];

  // Filtere Navigation basierend auf Benutzerrolle
  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 pt-16">
      {/* User Info */}
      <div className="mb-8 p-4 border rounded-lg">
        <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {isAdmin && (
          <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            Administrator
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full justify-start gap-3 mt-6"
        onClick={handleLogout}
      >
        <LogOut size={20} />
        <span>Abmelden</span>
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-background border rounded-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Sidebar */}
        {isOpen && (
          <div className="fixed inset-0 z-40">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            {/* Sidebar */}
            <aside className="absolute left-0 top-0 h-full w-64 bg-background border-r shadow-lg">
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    );
  }

  return (
    <aside className="hidden md:block w-64 bg-background border-r h-screen">
      {sidebarContent}
    </aside>
  );
}