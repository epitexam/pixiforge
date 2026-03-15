import React from 'react';

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3L21 7L7 21H3V17L17 3Z" />
        <path d="M15 5L19 9" />
    </svg>
);

export const EraserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21L21 9L15 3L3 15L9 21Z" />
        <path d="M15 21H21" />
    </svg>
);

export const PickerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20L10 14" />
        <path d="M12 8L16 12" />
        <path d="M19 5L15 9" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
    </svg>
);

export const SelectIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 3" />
    </svg>
);