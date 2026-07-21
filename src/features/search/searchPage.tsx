import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, SearchX } from "lucide-react";
import { useSearchTasks } from "@/features/search/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const { data: results, isLoading, isFetching } = useSearchTasks(query);

  function handleSearch() {
    setQuery(input);
  }

  const isSearching = (isLoading || isFetching) && !!query;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-8 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" aria-label="Volver a proyectos">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">
            Buscar tareas por significado
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-8">
        <Card>
          <CardContent className="flex gap-2 pt-6">
            <Input
              placeholder="Ej: cosas de salud, temas del trabajo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} size="icon" aria-label="Buscar">
              <Search />
            </Button>
          </CardContent>
        </Card>

        {isSearching && (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!isSearching && (
          <div className="space-y-4">
            {results?.map(({ task, distance }) => {
              const relevance = 1 - distance;
              return (
                <Card key={task.id} className="shadow-sm">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{task.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(0, Math.min(1, relevance)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {relevance.toFixed(2)} relevancia
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {results?.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                <SearchX className="size-10" />
                <p>Sin resultados relevantes.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
