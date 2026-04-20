import { useEffect, useState } from "react";
import { useStudio } from "@/state/studio-store";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Save, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import type { OceanParams } from "@/types/ocean-params";
import { Link } from "react-router-dom";

interface Props {
  params: OceanParams;
  onLoad: (p: OceanParams) => void;
}

interface Row {
  id: string;
  name: string;
  description: string | null;
  params: OceanParams;
  created_at: string;
}

export function ProfilesDrawer({ params, onLoad }: Props) {
  const close = useStudio(s => s.closeLeftDrawer);
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ocean_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as any);
  };

  useEffect(() => { if (user) load(); }, [user?.id]);

  const save = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error("Name required"); return; }
    setBusy(true);
    const { error } = await supabase.from("ocean_profiles").insert({
      user_id: user.id, name: name.trim(), params: params as any,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setName("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("ocean_profiles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">Saved Profiles</h2>
        <button onClick={close} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>

      {!user ? (
        <div className="p-4 space-y-3">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">Sign in to save your ocean tunings.</p>
          <Link to="/auth"><Button className="w-full font-mono text-xs">Sign in</Button></Link>
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-border space-y-2">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Profile name…" className="text-xs font-mono" />
            <Button onClick={save} disabled={busy} className="w-full font-mono text-xs">
              <Save className="h-3 w-3 mr-2" /> Save current
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {rows.length === 0 && (
              <div className="p-4 text-xs font-mono text-muted-foreground text-center">No saved profiles yet.</div>
            )}
            {rows.map(r => (
              <div key={r.id} className="px-3 py-2 border-b border-border hover:bg-panel-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-foreground truncate">{r.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { onLoad(r.params); toast.success(`Loaded "${r.name}"`); }} className="p-1 text-muted-foreground hover:text-primary" title="Load">
                      <Download className="h-3 w-3" />
                    </button>
                    <button onClick={() => remove(r.id)} className="p-1 text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}