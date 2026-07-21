import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  type Task,
} from "@/features/tasks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const { data: tasks, isLoading } = useTasks(id);
  const createTask = useCreateTask(id);
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask(id);

  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleCreate() {
    if (!title.trim()) return;
    createTask.mutate(title, { onSuccess: () => setTitle("") });
  }

  function openEdit(task: Task) {
    setEditing(task);
    setEditTitle(task.title);
  }

  function handleUpdateTitle() {
    if (!editing) return;
    updateTask.mutate(
      { taskId: editing.id, title: editTitle },
      { onSuccess: () => setEditing(null) },
    );
  }

  function handleDelete() {
    if (deletingId === null) return;
    deleteTask.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
  }

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <Link
        to="/dashboard"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a proyectos
      </Link>
      <h1 className="text-2xl font-bold">Tareas</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Nueva tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={createTask.isPending}>
          Agregar
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando tareas...</p>}

      <ul className="space-y-2">
        {tasks?.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-md border p-3"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) =>
                updateTask.mutate({
                  taskId: task.id,
                  completed: checked === true,
                })
              }
            />
            <span
              className={
                task.completed
                  ? "flex-1 line-through text-muted-foreground"
                  : "flex-1"
              }
            >
              {task.title}
            </span>
            <Button variant="ghost" size="icon" onClick={() => openEdit(task)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingId(task.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
        {tasks?.length === 0 && (
          <p className="text-muted-foreground">
            No hay tareas en este proyecto.
          </p>
        )}
      </ul>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTitle} disabled={updateTask.isPending}>
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
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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
