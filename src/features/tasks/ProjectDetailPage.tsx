import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useTasks,
  useCreateTask,
  useToggleTask,
  useDeleteTask,
} from "@/features/tasks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const { data: tasks, isLoading } = useTasks(id);
  const createTask = useCreateTask(id);
  const toggleTask = useToggleTask(id);
  const deleteTask = useDeleteTask(id);
  const [title, setTitle] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    createTask.mutate(title, { onSuccess: () => setTitle("") });
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
                toggleTask.mutate({
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask.mutate(task.id)}
            >
              Eliminar
            </Button>
          </li>
        ))}
        {tasks?.length === 0 && (
          <p className="text-muted-foreground">
            No hay tareas en este proyecto.
          </p>
        )}
      </ul>
    </div>
  );
}
