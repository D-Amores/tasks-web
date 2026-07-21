import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSendMessage } from "@/features/chat/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bot, Send, Sparkles, User } from "lucide-react";

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
    <div className="flex h-svh flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-8 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" aria-label="Volver a proyectos">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Asistente</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden p-8">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Sparkles className="size-10" />
              <p>Pregúntame sobre tus proyectos y tareas, o pídeme que cree algo.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-background ring-1 ring-foreground/10"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex items-end justify-start gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-4" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-background px-4 py-3 shadow-sm ring-1 ring-foreground/10">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex gap-2 rounded-xl bg-background p-2 shadow-sm ring-1 ring-foreground/10">
          <Input
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={sendMessage.isPending}
            className="border-none shadow-none focus-visible:ring-0"
          />
          <Button
            onClick={handleSend}
            disabled={sendMessage.isPending || !input.trim()}
            size="icon"
            aria-label="Enviar"
          >
            <Send />
          </Button>
        </div>
      </main>
    </div>
  );
}
