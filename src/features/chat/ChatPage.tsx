import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSendMessage } from "@/features/chat/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const sendMessage = useSendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    sendMessage.mutate(text, {
      onSuccess: (reply) => {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Hubo un error al procesar tu mensaje.",
          },
        ]);
      },
    });
  }

  return (
    <div className="mx-auto flex h-svh max-w-2xl flex-col p-8">
      <Link
        to="/dashboard"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a proyectos
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Asistente</h1>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground">
            Pregúntame sobre tus proyectos y tareas, o pídeme que cree algo.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sendMessage.isPending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Pensando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={sendMessage.isPending}
        />
        <Button onClick={handleSend} disabled={sendMessage.isPending}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
