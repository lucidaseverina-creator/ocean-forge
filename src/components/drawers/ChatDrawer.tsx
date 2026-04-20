import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useStudio } from "@/state/studio-store";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Send, Image as ImageIcon, Sparkles, Camera } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { OceanParams } from "@/types/ocean-params";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  images?: string[];        // displayed inline (data: URLs or https)
  param_changes?: { key: string; value: number }[];
}

interface Props {
  params: OceanParams;
  onApplyChanges: (changes: { key: string; value: number }[]) => void;
}

function setNested(obj: any, path: string, value: number): any {
  const parts = path.split(".");
  if (parts.length === 1) return { ...obj, [parts[0]]: value };
  return { ...obj, [parts[0]]: setNested(obj[parts[0]] ?? {}, parts.slice(1).join("."), value) };
}

export function ChatDrawer({ params, onApplyChanges }: Props) {
  const close = useStudio(s => s.closeLeftDrawer);
  const captureCanvas = useStudio(s => s.captureCanvas);
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [generateReference, setGenerateReference] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput("");

    const screenshot = includeScreenshot && captureCanvas ? captureCanvas() : null;
    const userMsg: ChatMsg = { role: "user", content: text, images: screenshot ? [screenshot] : undefined };
    setMsgs(m => [...m, userMsg]);

    try {
      const { data, error } = await supabase.functions.invoke("ai-wave-chat", {
        body: {
          messages: [...msgs, userMsg].map(m => ({
            role: m.role,
            content: m.content,
            image: m.images?.[0],
          })),
          params,
          screenshot,
          generateReference,
        },
      });
      if (error) throw error;

      const reply: ChatMsg = {
        role: "assistant",
        content: data.text ?? "",
        images: data.images ?? [],
        param_changes: data.param_changes ?? [],
      };
      setMsgs(m => [...m, reply]);

      if (data.param_changes?.length) {
        onApplyChanges(data.param_changes);
        toast.success(`Applied ${data.param_changes.length} change${data.param_changes.length > 1 ? "s" : ""}`);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Chat failed");
      setMsgs(m => [...m, { role: "assistant", content: `⚠️ ${err.message ?? "Error"}` }]);
    } finally {
      setBusy(false);
      setIncludeScreenshot(false);
      setGenerateReference(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">AI Wave Studio</h2>
        <button onClick={close} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>

      {!user ? (
        <div className="p-4 space-y-3">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Sign in to chat with the AI wave studio. The AI can read your parameters, screenshot the canvas, critique the look, generate reference renders with Nano Banana Pro, and tune sliders for you.
          </p>
          <Link to="/auth"><Button className="w-full font-mono text-xs">Sign in</Button></Link>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
            {msgs.length === 0 && (
              <div className="text-xs font-mono text-muted-foreground space-y-2">
                <p className="text-primary">Wave-development AI ready.</p>
                <p>Try: "Critique my current ocean. What three sliders would most improve realism?"</p>
                <p>Or check 📷 + 🎨 and ask: "Show me what this should look like as a stormy north-Atlantic sea."</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-md px-3 py-2 text-xs font-mono ${
                  m.role === "user" ? "bg-primary/20 text-foreground" : "bg-muted text-secondary-foreground"
                }`}>
                  {m.images?.map((src, j) => (
                    <img key={j} src={src} alt="" className="mb-2 rounded-sm border border-border max-w-full" />
                  ))}
                  <div className="prose prose-invert prose-sm max-w-none [&_*]:!text-inherit [&_*]:!font-mono [&_*]:!text-xs">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  {m.param_changes && m.param_changes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider text-primary">Applied changes</div>
                      {m.param_changes.map((c, k) => (
                        <div key={k} className="text-[10px] text-muted-foreground">→ {c.key} = {c.value}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="text-xs font-mono text-muted-foreground italic">thinking…</div>
            )}
          </div>

          <div className="border-t border-border p-2 space-y-2">
            <div className="flex gap-1 text-[10px] font-mono">
              <button
                onClick={() => setIncludeScreenshot(s => !s)}
                className={`px-2 py-1 rounded-sm border border-border flex items-center gap-1 ${includeScreenshot ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Camera className="h-3 w-3" /> Screenshot
              </button>
              <button
                onClick={() => setGenerateReference(s => !s)}
                className={`px-2 py-1 rounded-sm border border-border flex items-center gap-1 ${generateReference ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Generate a reference render with Nano Banana Pro"
              >
                <Sparkles className="h-3 w-3" /> Reference render
              </button>
            </div>
            <div className="flex gap-1">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                placeholder="Ask the AI…"
                className="flex-1 text-xs font-mono bg-muted text-foreground px-2 py-1.5 rounded-sm border border-border outline-none focus:border-primary resize-none"
              />
              <Button onClick={send} disabled={busy || !input.trim()} size="icon" className="self-stretch">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}