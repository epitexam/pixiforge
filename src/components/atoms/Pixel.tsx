import React from 'react';
import { Color } from '../../types';

export interface PixelProps {
    color: Color;
    size?: number;
    x: number;
    y: number;
    onClick?: (x: number, y: number) => void;
    onMouseDown?: (x: number, y: number) => void;
    onMouseEnter?: (x: number, y: number) => void;
    onMouseLeave?: (x: number, y: number) => void;
    className?: string;
}

export const Pixel: React.FC<PixelProps> = ({
    color,
    size = 16,
    x,
    y,
    onClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    className = '',
}) => {
    return (
        <div
            className={`box-border inline-block ${className}`}
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderRight: '1px solid rgba(0,0,0,0.08)',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}
            onClick={() => onClick?.(x, y)}
            onMouseDown={() => onMouseDown?.(x, y)}
            onMouseEnter={() => onMouseEnter?.(x, y)}
            onMouseLeave={() => onMouseLeave?.(x, y)}
            role="gridcell"
            aria-label={`Pixel at (${x}, ${y})`}
        />
    );
};

export default Pixel;