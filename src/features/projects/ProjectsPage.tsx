import { useState } from "react";
import { useProjects, useCreateProject } from "@/features/projects/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";
import { ChevronRight, FolderKanban, LogOut, MessageCircle, Search } from "lucide-react";

export function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const createProject = useCreateProject();
  const logout = useAuthStore((state) => state.logout);
  const [name, setName] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    createProject.mutate({ name }, { onSuccess: () => setName("") });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Mis proyectos</h1>
          <div className="flex items-center gap-2">
            <Link to="/search">
              <Button variant="ghost" size="icon" aria-label="Buscar">
                <Search />
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="ghost" size="icon" aria-label="Asistente">
                <MessageCircle />
              </Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-8">
        <Card>
          <CardContent className="flex gap-2 pt-6">
            <Input
              placeholder="Nombre del proyecto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={createProject.isPending}>
              Crear
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center justify-between pt-6">
              <p className="text-destructive">Error al cargar proyectos.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="space-y-5">
            {projects?.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="block">
                <Card className="cursor-pointer shadow-sm transition-all hover:shadow-md hover:ring-primary/30">
                  <CardContent className="flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FolderKanban className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{project.name}</p>
                      {project.description && (
                        <p className="truncate text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
            {projects?.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                <FolderKanban className="h-10 w-10" />
                <p>Aún no tienes proyectos.</p>
                <p className="text-sm">Crea el primero usando el formulario de arriba.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
