import { useState, useCallback } from "react";
import { OceanScene } from "@/components/ocean/OceanScene";
import { ParameterPanel } from "@/components/ide/ParameterPanel";
import { NavigatorPanel } from "@/components/ide/NavigatorPanel";
import { StatusBar } from "@/components/ide/StatusBar";
import { Toolbar } from "@/components/ide/Toolbar";
import { defaultOceanParams, type OceanParams } from "@/types/ocean-params";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";

const Index = () => {
  const [params, setParams] = useState<OceanParams>(defaultOceanParams);
  const [isPlaying, setIsPlaying] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const handleReset = useCallback(() => {
    setParams(defaultOceanParams);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <Toolbar
        params={params}
        onReset={handleReset}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        isPlaying={isPlaying}
      />

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Navigator */}
        {leftOpen && (
          <div className="w-56 border-r border-border flex flex-col shrink-0">
            <NavigatorPanel />
          </div>
        )}

        {/* Center: Viewport */}
        <div className="flex-1 flex flex-col relative">
          {/* Panel toggle buttons */}
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="p-1 rounded bg-panel-header/80 backdrop-blur border border-border text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Navigator"
            >
              {leftOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>
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

        {/* Right: Inspector */}
        {rightOpen && (
          <div className="w-72 border-l border-border flex flex-col shrink-0">
            <ParameterPanel params={params} onChange={setParams} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <StatusBar params={params} />
    </div>
  );
};

export default Index;
