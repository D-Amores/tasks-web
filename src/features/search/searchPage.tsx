import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useSearchTasks } from "@/features/search/api";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const { data: results, isLoading, isFetching } = useSearchTasks(query);

  function handleSearch() {
    setQuery(input);
  }

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <Link
        to="/dashboard"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a proyectos
      </Link>
      <h1 className="text-2xl font-bold">Buscar tareas por significado</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Ej: cosas de salud, temas del trabajo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="rounded-md border px-3 hover:bg-accent"
        >
          <Search className="size-4" />
        </button>
      </div>

      {(isLoading || isFetching) && query && (
        <p className="text-muted-foreground">Buscando...</p>
      )}

      <div className="space-y-3">
        {results?.map(({ task, distance }) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="text-base">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Relevancia: {(1 - distance).toFixed(2)}
            </CardContent>
          </Card>
        ))}
        {results?.length === 0 && (
          <p className="text-muted-foreground">Sin resultados relevantes.</p>
        )}
      </div>
    </div>
  );
}
