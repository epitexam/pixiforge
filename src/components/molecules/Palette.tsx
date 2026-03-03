import React from 'react';
import { Color } from '../../types';

export interface PaletteProps {
    colors: Color[];
    selectedColor: Color;
    onSelectColor: (color: Color) => void;
    className?: string;
    swatchSize?: number;
}

export const Palette: React.FC<PaletteProps> = ({
    colors,
    selectedColor,
    onSelectColor,
    className = '',
    swatchSize = 24,
}) => {
    return (
        <div
            className={`palette ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, ${swatchSize}px)`,
                gap: '4px',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
            }}
        >
            {colors.map((color) => (
                <button
                    key={color}
                    onClick={() => onSelectColor(color)}
                    style={{
                        width: swatchSize,
                        height: swatchSize,
                        backgroundColor: color,
                        border: color === selectedColor ? '3px solid #000' : '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: 0,
                        outline: 'none',
                    }}
                    aria-label={`Select color ${color}`}
                    title={color}
                />
            ))}
        </div>
    );
};

export default Palette;