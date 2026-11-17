import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Bot, ChevronDown, UserRound } from "lucide-react";
import { queryKnowledge } from "../../services/api";
import type { QueryResult } from "../../types/api";
import { Feedback } from "../common/Feedback";

export function ChatPanel({ hasKnowledge }: { hasKnowledge: boolean }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; result?: QueryResult }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!question.trim() || loading) return;
    const currentQuestion = question.trim();
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: currentQuestion }]);
    setLoading(true);
    setError(null);
    try {
      const result = await queryKnowledge(currentQuestion);
      setMessages((current) => [...current, { role: "assistant", text: result.answer, result }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not answer question");
    } finally {
      setLoading(false);
    }
  }

  return <section className="assistant-panel" id="assistant">
    <div className="section-heading"><div><span className="eyebrow">AI assistant</span><h2>Ask your knowledge base</h2></div><span className="ai-pill"><Bot size={14} /> Grounded answers</span></div>
    <div className="chat-history">
      {messages.length === 0 && <div className="chat-empty"><Bot size={28} /><p>Ask a question about your saved notes and webpages. Answers are generated only from retrieved sources.</p></div>}
      {messages.map((message, index) => <div className={`message message-${message.role}`} key={`${message.role}-${index}`}><div className="message-avatar">{message.role === "user" ? <UserRound size={15} /> : <Bot size={15} />}</div><div className="message-body"><ReactMarkdown>{message.text}</ReactMarkdown>{message.result && message.result.sources.length > 0 && <details className="sources"><summary><ChevronDown size={14} /> {message.result.sources.length} sources</summary>{message.result.sources.map((source) => <div className="source" key={source.chunkId}><strong>{source.title}</strong><span>{source.snippet}</span><small>Relevance {(source.similarity * 100).toFixed(0)}%</small></div>)}</details>}</div></div>)}
      {loading && <div className="message message-assistant"><div className="message-avatar"><Bot size={15} /></div><div className="typing">Searching your knowledge...</div></div>}
    </div>
    {error && <Feedback tone="error">{error}</Feedback>}
    <div className="query-box"><input disabled={!hasKnowledge || loading} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} placeholder={hasKnowledge ? "What would you like to know?" : "Add a completed item to ask questions"} /><button className="send-button" disabled={!hasKnowledge || loading || !question.trim()} onClick={() => void submit()} aria-label="Ask question"><ArrowUp size={17} /></button></div>
  </section>;
}
