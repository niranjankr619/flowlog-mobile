"use client";

import * as React from "react";
import { cn } from "./utils";

interface SliderProps {
  className?: string;
  defaultValue?: number[];
  value?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

function Slider({
  className,
  defaultValue = [0],
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(value || defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [parseFloat(e.target.value)];
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const percentage = ((currentValue[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none items-center select-none", className)}>
      <div className="relative w-full h-4">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
          {/* Range */}
          <div 
            className="absolute h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Native input (hidden but functional) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={handleChange}
          disabled={disabled}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {/* Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full border-2 border-primary bg-background shadow-sm transition-all pointer-events-none"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export { Slider };
