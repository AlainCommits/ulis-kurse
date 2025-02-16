import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { admin, type CourseData } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

export function AdminCourseManager() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: '',
    maxParticipants: '10',
  });

  // Redirect wenn kein Admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await admin.getAllCourses();
      console.log('Courses response:', response.data); // Debug log
      setCourses(response.data.data.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError("Fehler beim Laden der Kurse");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const courseData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants),
        status: 'aktiv'
      };

      if (editingCourse) {
        await admin.updateCourse(editingCourse._id, courseData);
      } else {
        await admin.createCourse(courseData);
      }

      await fetchCourses();
      resetForm();
    } catch (err) {
      console.error('Error saving course:', err);
      setError(editingCourse ? "Fehler beim Aktualisieren des Kurses" : "Fehler beim Erstellen des Kurses");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Möchten Sie diesen Kurs wirklich löschen?")) {
      return;
    }

    try {
      await admin.deleteCourse(courseId);
      await fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError("Fehler beim Löschen des Kurses");
    }
  };

  const handleEdit = (course: CourseData) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      startDate: new Date(course.startDate).toISOString().split('T')[0],
      endDate: new Date(course.endDate).toISOString().split('T')[0],
      category: course.category,
      maxParticipants: course.maxParticipants.toString(),
    });
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      category: '',
      maxParticipants: '10',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Lade Kurse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 md:mt-0 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Kursverwaltung</h1>
      </div>
  
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 md:p-4 rounded">
          {error}
        </div>
      )}
  
      {/* Zweispaltiges Layout ab `md`-Größe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kurs-Formular (Linke Spalte) */}
        <Card className="md:h-fit">
          <CardHeader>
            <CardTitle>{editingCourse ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[120px] px-3 py-2 rounded-md border"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Startdatum</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Enddatum</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximale Teilnehmerzahl</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={e => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                  required
                />
              </div>
  
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                {editingCourse && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                )}
                <Button type="submit">
                  {editingCourse ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
  
        {/* Kursliste (Rechte Spalte) */}
        <div className="space-y-4">
          {courses.map(course => (
            <Card key={course._id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="space-y-2 w-full md:w-auto">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                    <div className="text-sm space-y-1">
                      <p>Kategorie: {course.category}</p>
                      <p>Zeitraum: {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</p>
                      <p>Teilnehmer: {course.participantCount || 0} / {course.maxParticipants}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto mt-4 md:mt-0">
                    <Button variant="outline" onClick={() => handleEdit(course)} className="w-full sm:w-auto">
                      Bearbeiten
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDelete(course._id)}
                      className="w-full sm:w-auto"
                    >
                      Löschen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
  
          {courses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">Keine Kurse vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}