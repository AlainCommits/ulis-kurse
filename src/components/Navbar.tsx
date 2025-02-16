import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="text-xl font-semibold">
            Ulis Physiotherapie
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/kurse">Kurse</Link>
            </Button>
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard/kurse">Meine Kurse</Link>
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/dashboard/admin/kurse">Kursverwaltung</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link to="/dashboard/admin/benutzer">Benutzerverwaltung</Link>
                    </Button>
                  </>
                )}
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="destructive" onClick={logout}>
                  Abmelden
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/register">Registrieren</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Anmelden</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" asChild className="justify-start" onClick={() => setIsOpen(false)}>
                <Link to="/kurse">Kurse</Link>
              </Button>
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild className="justify-start" onClick={() => setIsOpen(false)}>
                    <Link to="/dashboard/kurse">Meine Kurse</Link>
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" asChild className="justify-start" onClick={() => setIsOpen(false)}>
                        <Link to="/dashboard/admin/kurse">Kursverwaltung</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start" onClick={() => setIsOpen(false)}>
                        <Link to="/dashboard/admin/benutzer">Benutzerverwaltung</Link>
                      </Button>
                    </>
                  )}
                  <Button asChild className="justify-start" onClick={() => setIsOpen(false)}>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="destructive" className="justify-start" onClick={logout}>
                    Abmelden
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start" onClick={() => setIsOpen(false)}>
                    <Link to="/register">Registrieren</Link>
                  </Button>
                  <Button asChild className="justify-start" onClick={() => setIsOpen(false)}>
                    <Link to="/login">Anmelden</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
