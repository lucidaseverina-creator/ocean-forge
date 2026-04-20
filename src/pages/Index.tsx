import { useState, useCallback } from "react";
import { OceanScene } from "@/components/ocean/OceanScene";
import { ParameterPanel } from "@/components/ide/ParameterPanel";
import { StatusBar } from "@/components/ide/StatusBar";
import { Toolbar } from "@/components/ide/Toolbar";
import { SectionRail } from "@/components/ide/SectionRail";
import { ChatDrawer } from "@/components/drawers/ChatDrawer";
import { AccountDrawer } from "@/components/drawers/AccountDrawer";
import { ProfilesDrawer } from "@/components/drawers/ProfilesDrawer";
import { EncyclopediaDrawer } from "@/components/drawers/EncyclopediaDrawer";
import { useStudio } from "@/state/studio-store";
import { defaultOceanParams, type OceanParams } from "@/types/ocean-params";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

function setNested(obj: any, path: string, value: number): any {
  const parts = path.split(".");
  if (parts.length === 1) return { ...obj, [parts[0]]: value };
  return { ...obj, [parts[0]]: setNested(obj[parts[0]] ?? {}, parts.slice(1).join("."), value) };
}

const Index = () => {
  const [params, setParams] = useState<OceanParams>(defaultOceanParams);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const leftDrawer = useStudio(s => s.leftDrawer);

  const handleReset = useCallback(() => {
    setParams(defaultOceanParams);
  }, []);

  const applyChanges = useCallback((changes: { key: string; value: number }[]) => {
    setParams(prev => {
      let next: any = prev;
      for (const c of changes) next = setNested(next, c.key, c.value);
      return next as OceanParams;
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <Toolbar
        params={params}
        onReset={handleReset}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        isPlaying={isPlaying}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: contextual drawer (chat, encyclopedia, profiles, account) */}
        {leftDrawer && (
          <div className="w-[26rem] border-r border-border flex flex-col shrink-0">
            {leftDrawer === "chat" && <ChatDrawer params={params} onApplyChanges={applyChanges} />}
            {leftDrawer === "encyclopedia" && <EncyclopediaDrawer />}
            {leftDrawer === "profiles" && <ProfilesDrawer params={params} onLoad={setParams} />}
            {leftDrawer === "account" && <AccountDrawer />}
          </div>
        )}

        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-1 rounded bg-panel-header/80 backdrop-blur border border-border text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Inspector"
            >
              {rightOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex-1">
            <OceanScene params={params} />
          </div>
        </div>

        {/* Right: Inspector — single-section view */}
        {rightOpen && (
          <div className="w-72 border-l border-border flex flex-col shrink-0">
            <ParameterPanel params={params} onChange={setParams} />
          </div>
        )}
        {/* Right: icon rail (always visible) */}
        <SectionRail />
      </div>

      <StatusBar params={params} />
    </div>
  );
};

export default Index;
