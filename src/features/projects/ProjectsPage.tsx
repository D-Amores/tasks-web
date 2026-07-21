import { useState, type MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  type Project,
} from "@/features/projects/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/auth";
import {
  ChevronRight,
  FolderKanban,
  LogOut,
  MessageCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

export function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleCreate() {
    if (!name.trim()) return;
    createProject.mutate({ name }, { onSuccess: () => setName("") });
  }

  function openEdit(e: MouseEvent, project: Project) {
    e.stopPropagation();
    setEditing(project);
    setEditName(project.name);
    setEditDescription(project.description ?? "");
  }

  function handleUpdate() {
    if (!editing) return;
    updateProject.mutate(
      { id: editing.id, name: editName, description: editDescription },
      { onSuccess: () => setEditing(null) },
    );
  }

  function confirmDelete(e: MouseEvent, id: number) {
    e.stopPropagation();
    setDeletingId(id);
  }

  function handleDelete() {
    if (deletingId === null) return;
    deleteProject.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Mis proyectos
          </h1>
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
              <Card
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="cursor-pointer shadow-sm transition-all hover:shadow-md hover:ring-primary/30"
              >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => openEdit(e, project)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => confirmDelete(e, project.id)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
            {projects?.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                <FolderKanban className="h-10 w-10" />
                <p>Aún no tienes proyectos.</p>
                <p className="text-sm">
                  Crea el primero usando el formulario de arriba.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateProject.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todas sus
              tareas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
