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
    const handleClick = () => {
        onClick?.(x, y);
    };

    const handleMouseDown = () => {
        onMouseDown?.(x, y);
    };

    const handleMouseEnter = () => {
        onMouseEnter?.(x, y);
    };

    const handleMouseLeave = () => {
        onMouseLeave?.(x, y);
    };

    return (
        <div
            className={`pixel ${className}`}
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                boxSizing: 'border-box',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'inline-block',
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="gridcell"
            aria-label={`Pixel at (${x}, ${y})`}
        />
    );
};

export default Pixel;