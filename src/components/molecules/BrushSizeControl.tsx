import React from 'react';

interface BrushSizeControlProps {
  value: number;
  onChange: (value: number) => void;
}

export const BrushSizeControl: React.FC<BrushSizeControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-600">
        <span>Brush size</span>
        <span className="text-gray-400">{value}px</span>
      </div>
      <input
        type="range"
        min="1"
        max="16"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
};

export default BrushSizeControl;
