import { useStudio } from "@/state/studio-store";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, LogOut, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function AccountDrawer() {
  const close = useStudio(s => s.closeLeftDrawer);
  const { user, loading } = useAuth();

  return (
    <div className="h-full flex flex-col bg-panel-bg">
      <div className="px-3 py-2 bg-panel-header border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary text-glow">Account</h2>
        <button onClick={close} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-xs font-mono text-muted-foreground">Loading…</div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono text-foreground truncate">{user.email}</div>
                <div className="text-[10px] font-mono text-muted-foreground">Signed in</div>
              </div>
            </div>
            <Button
              variant="outline" className="w-full font-mono text-xs"
              onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out"); }}
            >
              <LogOut className="h-3 w-3 mr-2" /> Sign out
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Sign in to save ocean profiles, chat with the AI wave studio, and persist camera presets.
            </p>
            <Link to="/auth">
              <Button className="w-full font-mono text-xs">Sign in / Create account</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}