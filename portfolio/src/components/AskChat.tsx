"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, RefreshCw, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  error?: boolean;
};

type SSEData = {
  type?: string;
  text?: string;
  sources?: string[];
  error?: string;
};

const MODES = [
  ["auto", "Auto"],
  ["portfolio", "Portfolio"],
  ["recruiter", "Recruiter"],
] as const;

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-3 mt-1 text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h1>
  ),

  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-2.5 mt-5 text-base font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),

  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-4 text-[14px] font-semibold text-foreground">
      {children}
    </h3>
  ),

  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2.5 last:mb-0">{children}</p>
  ),

  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-2.5 space-y-1.5 pl-5">{children}</ul>
  ),

  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-2.5 list-decimal space-y-1.5 pl-5">{children}</ol>
  ),

  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1 marker:text-primary">{children}</li>
  ),

  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),

  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-foreground/90">{children}</em>
  ),

  del: ({ children }: { children?: React.ReactNode }) => (
    <del className="text-muted-foreground">{children}</del>
  ),

  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-3 border-l-2 border-primary/60 pl-3 text-body">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-4 border-border" />,

  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),

  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    const isBlock = Boolean(className?.includes("language-"));

    if (isBlock) {
      return (
        <code
          className={`block overflow-x-auto font-mono text-[12px] leading-relaxed text-primary ${
            className ?? ""
          }`}
        >
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[12px] text-primary">
        {children}
      </code>
    );
  },

  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-3 overflow-x-auto rounded-xl border border-border bg-card p-3">
      {children}
    </pre>
  ),

  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="border-b border-border bg-elevated">{children}</thead>
  ),

  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),

  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="transition-colors hover:bg-elevated/50">{children}</tr>
  ),

  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2.5 font-semibold text-foreground">{children}</th>
  ),

  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2.5 text-body">{children}</td>
  ),
};

export function AskChat({
  suggestions,
  name,
}: {
  suggestions: string[];
  name: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<string>("auto");

  const conv = useRef<string | undefined>(undefined);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [msgs]);

  const sid = () => {
    try {
      return (
        localStorage.getItem("ai_sid") ??
        (localStorage.setItem("ai_sid", crypto.randomUUID()),
        localStorage.getItem("ai_sid")!)
      );
    } catch {
      return "anon-" + Math.random().toString(36).slice(2, 12);
    }
  };

  async function send(text: string) {
    text = text.trim();

    if (!text || busy) return;

    setInput("");
    setBusy(true);

    setMsgs((messages) => [
      ...messages,
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    const patch = (update: (assistant: Msg) => Msg) => {
      setMsgs((messages) =>
        messages.map((message, index) =>
          index === messages.length - 1 ? update(message) : message,
        ),
      );
    };

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          mode,
          sessionId: sid(),
          conversationId: conv.current,
        }),
      });

      if (!response.ok || !response.body) {
        const json = await response.json().catch(() => ({}));

        throw new Error(
          json.error ??
            "AI service is temporarily unavailable. Please try again shortly.",
        );
      }

      conv.current = response.headers.get("x-conversation-id") || conv.current;

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((line) => line.startsWith("data:"));

          if (!line) continue;

          const raw = line.slice(5).trim();

          if (!raw) continue;

          let data: SSEData;

          try {
            data = JSON.parse(raw);
          } catch {
            console.warn("Invalid SSE event:", raw);
            continue;
          }

          if (data.type === "token" && data.text) {
            patch((assistant) => ({
              ...assistant,
              content: assistant.content + data.text,
            }));
          }

          if (data.type === "sources") {
            patch((assistant) => ({
              ...assistant,
              sources: data.sources ?? [],
            }));
          }

          if (data.type === "error") {
            throw new Error(data.error ?? "AI service returned an error.");
          }
        }
      }

      /*
       * Process any final buffered SSE event.
       */
      const finalEvent = buffer.trim();

      if (finalEvent) {
        const line = finalEvent
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (line) {
          const raw = line.slice(5).trim();

          if (raw) {
            try {
              const data: SSEData = JSON.parse(raw);

              if (data.type === "token" && data.text) {
                patch((assistant) => ({
                  ...assistant,
                  content: assistant.content + data.text,
                }));
              }

              if (data.type === "sources") {
                patch((assistant) => ({
                  ...assistant,
                  sources: data.sources ?? [],
                }));
              }

              if (data.type === "error") {
                throw new Error(data.error ?? "AI service returned an error.");
              }
            } catch (error) {
              console.warn("Failed to parse final SSE event:", error);
            }
          }
        }
      }
    } catch (error) {
      patch((assistant) => ({
        ...assistant,
        content:
          error instanceof Error
            ? error.message
            : "AI service is temporarily unavailable. Please try again shortly.",
        error: true,
      }));
    } finally {
      setBusy(false);
    }
  }

  const regen = () => {
    const lastUserMessage = [...msgs]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) return;

    setMsgs((messages) => messages.slice(0, -2));

    send(lastUserMessage.content);
  };

  const bubble =
    "max-w-[92%] rounded-2xl px-4 py-3.5 text-[14.5px] leading-7 sm:max-w-[78%]";

  return (
    <div className="overflow-hidden rounded-[20px] border border-primary/30 bg-card shadow-[0_0_70px_var(--p12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="orb" />

          <div>
            <b className="text-[15px] text-foreground">{name}&apos;s Agent</b>

            <div className="mono text-[9px] text-success">
              Online · grounded in the portfolio
            </div>
          </div>
        </div>

        <div className="flex gap-1.5" role="radiogroup" aria-label="Mode">
          {MODES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={`pill cursor-pointer !px-3 !py-1.5 ${
                mode === value
                  ? "!border-primary !bg-primary !text-on-primary"
                  : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex h-[min(58dvh,540px)] flex-col gap-3.5 overflow-y-auto px-4 py-5 sm:px-6"
        aria-live="polite"
      >
        {msgs.length === 0 && (
          <div className="m-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="pill cursor-pointer text-center normal-case transition-all hover:!border-primary hover:!text-primary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {msgs.map((message, index) =>
          message.role === "user" ? (
            <div
              key={index}
              className={`${bubble} ml-auto rounded-br-md bg-elevated text-foreground`}
            >
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          ) : (
            <div
              key={index}
              className={`${bubble} rounded-bl-md border border-border bg-background ${
                message.error ? "text-red-400" : "text-body"
              }`}
            >
              {message.content ? (
                <div className="break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <span
                  className="flex gap-1.5 py-1"
                  aria-label="Assistant is typing"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />

                  <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:.18s]" />

                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:.36s]" />
                </span>
              )}

              {!!message.sources?.length && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3">
                  <span className="mono mr-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Grounded in
                  </span>

                  {message.sources.map((source) => (
                    <span
                      key={source}
                      className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              )}

              {message.content && !message.error && !busy && (
                <div className="mt-3 flex items-center gap-3 border-t border-border/60 pt-2.5 text-muted-foreground">
                  <button
                    type="button"
                    aria-label="Copy response"
                    title="Copy response"
                    onClick={() =>
                      navigator.clipboard.writeText(message.content)
                    }
                    className="transition-colors hover:text-primary"
                  >
                    <Copy size={14} />
                  </button>

                  {index === msgs.length - 1 && (
                    <button
                      type="button"
                      aria-label="Regenerate response"
                      title="Regenerate response"
                      onClick={regen}
                      className="transition-colors hover:text-primary"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ),
        )}

        <div ref={end} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2.5 border-t border-border px-4 py-4 sm:px-6"
      >
        <button
          type="button"
          aria-label="Clear conversation"
          title="Clear conversation"
          onClick={() => {
            setMsgs([]);
            conv.current = undefined;
          }}
          className="grid size-11 flex-none place-items-center rounded-full border border-border text-body transition-colors hover:border-primary hover:text-primary"
        >
          <Trash2 size={17} />
        </button>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={1000}
          placeholder="Ask about any project, skill, or service…"
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />

        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          title="Send message"
          className="grid size-11 flex-none place-items-center rounded-full bg-primary text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
