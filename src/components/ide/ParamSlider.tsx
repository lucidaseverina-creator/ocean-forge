import { useCallback, useState } from "react";

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function ParamSlider({ label, value, min, max, step, unit = "", onChange }: ParamSliderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const percentage = ((value - min) / (max - min)) * 100;

  const handleDoubleClick = useCallback(() => {
    setEditValue(value.toFixed(step < 1 ? 2 : 0));
    setIsEditing(true);
  }, [value, step]);

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
    setIsEditing(false);
  }, [editValue, min, max, onChange]);

  return (
    <div className="flex items-center gap-2 py-1 group">
      <span className="text-xs font-mono text-muted-foreground w-28 truncate shrink-0">
        {label}
      </span>
      <div className="flex-1 relative h-4 flex items-center">
        <div className="absolute inset-0 h-1.5 top-1/2 -translate-y-1/2 rounded-full bg-slider-track overflow-hidden">
          <div
            className="h-full bg-slider-fill rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute h-3 w-3 rounded-full bg-slider-thumb shadow-md border border-background pointer-events-none transition-all duration-75"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => e.key === "Enter" && commitEdit()}
          autoFocus
          className="w-16 text-xs font-mono bg-muted text-foreground px-1.5 py-0.5 rounded border border-border text-right outline-none focus:border-primary"
        />
      ) : (
        <span
          className="text-xs font-mono text-secondary-foreground w-16 text-right cursor-pointer hover:text-primary transition-colors shrink-0"
          onDoubleClick={handleDoubleClick}
        >
          {value.toFixed(step < 1 ? 2 : step < 0.01 ? 3 : 0)}
          {unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
        </span>
      )}
    </div>
  );
}
