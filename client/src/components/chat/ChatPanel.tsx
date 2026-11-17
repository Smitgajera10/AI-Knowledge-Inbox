import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Bot, ChevronDown, UserRound } from "lucide-react";
import { queryKnowledge } from "../../services/api";
import type { QueryResult } from "../../types/api";
import { Feedback } from "../common/Feedback";

export function ChatPanel({ hasKnowledge }: { hasKnowledge: boolean }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string; result?: QueryResult }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!question.trim() || loading) return;
    const currentQuestion = question.trim();
    setQuestion("");
    setMessages((current) => [
      ...current,
      { role: "user", text: currentQuestion },
    ]);
    setLoading(true);
    setError(null);
    try {
      const result = await queryKnowledge(currentQuestion);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer, result },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not answer question",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500">
            AI assistant
          </span>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">
            Ask your knowledge base
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-600">
          <Bot size={14} /> Grounded answers
        </span>
      </div>
      <div className="my-6 grid max-h-[500px] min-h-40 gap-4 overflow-auto">
        {messages.length === 0 && (
          <div className="grid place-items-center content-center gap-2 text-center text-sm text-zinc-400">
            <Bot size={28} />
            <p>
              Ask a question about your saved notes and webpages. Answers are
              generated only from retrieved sources.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div className="flex gap-2" key={`${message.role}-${index}`}>
            <div
              className={`grid size-7 shrink-0 place-items-center rounded-lg ${message.role === "user" ? "bg-zinc-100 text-zinc-600" : "bg-indigo-50 text-indigo-500"}`}
            >
              {message.role === "user" ? (
                <UserRound size={15} />
              ) : (
                <Bot size={15} />
              )}
            </div>
            <div className="max-w-[82%] text-sm leading-relaxed text-zinc-700">
              <ReactMarkdown>{message.text}</ReactMarkdown>
              {message.result && message.result.sources.length > 0 && (
                <details className="mt-2 border-t border-zinc-100 pt-2">
                  <summary className="flex cursor-pointer items-center gap-1 text-xs text-indigo-500">
                    <ChevronDown size={14} /> {message.result.sources.length}{" "}
                    sources
                  </summary>
                  {message.result.sources.map((source) => (
                    <div
                      className="mt-2 grid gap-1 rounded-lg bg-zinc-50 p-2 text-xs"
                      key={source.chunkId}
                    >
                      <strong className="text-zinc-800">{source.title}</strong>
                      <span className="text-zinc-500">{source.snippet}</span>
                      <small className="text-zinc-400">
                        Relevance {(source.similarity * 100).toFixed(0)}%
                      </small>
                    </div>
                  ))}
                </details>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-500">
              <Bot size={15} />
            </div>
            <div className="pt-1 text-sm text-zinc-400">
              Searching your knowledge...
            </div>
          </div>
        )}
      </div>
      {error && <Feedback tone="error">{error}</Feedback>}
      <div className="flex items-center rounded-lg border border-zinc-300 px-3 w-full justify-between transition-all duration-200 hover:border-indigo-500 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <input
          disabled={!hasKnowledge || loading}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder={
            hasKnowledge
              ? "What would you like to know?"
              : "Add a completed item to ask questions"
          }
          className="w-full outline-none bg-transparent"
        />
        <button
          className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasKnowledge || loading || !question.trim()}
          onClick={() => void submit()}
          aria-label="Ask question"
        >
          <ArrowUp size={17} />
        </button>
      </div>
    </section>
  );
}
