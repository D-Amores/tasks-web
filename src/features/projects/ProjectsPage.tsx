import { useState } from "react";
import { useProjects, useCreateProject } from "@/features/projects/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";

export function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const createProject = useCreateProject();
  const logout = useAuthStore((state) => state.logout);
  const [name, setName] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    createProject.mutate({ name }, { onSuccess: () => setName("") });
  }

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis proyectos</h1>
        <Button variant="outline" onClick={logout}>
          Cerrar sesión
        </Button>
        <Link to="/search">
          <Button variant="outline">Buscar</Button>
        </Link>
        <Link to="/chat">
          <Button variant="outline">Asistente</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nombre del proyecto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={createProject.isPending}>
          Crear
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted-foreground">Cargando proyectos...</p>
      )}
      {isError && (
        <p className="text-destructive">Error al cargar proyectos.</p>
      )}

      <div className="space-y-3">
        {projects?.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{project.name}</CardTitle>
              </CardHeader>
              {project.description && (
                <CardContent className="text-sm text-muted-foreground">
                  {project.description}
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
        {projects?.length === 0 && (
          <p className="text-muted-foreground">Aún no tienes proyectos.</p>
        )}
      </div>
    </div>
  );
}
