"use client";

import React from 'react';
import Link from 'next/link';

interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    fullWidth?: boolean;
    disabled?: boolean;
}

export default function Button({
    children,
    href,
    variant = 'primary',
    size = 'md',
    className = '',
    style: customStyle, // Renamed to avoid conflict with the internal 'styles' variable
    onClick,
    fullWidth = false,
    disabled = false,
}: ButtonProps) {

    // Base styles
    let styles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        borderRadius: 'var(--radius-full)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        border: 'none',
        width: fullWidth ? '100%' : 'auto',
        ...customStyle,
    };

    // Size styles
    if (size === 'sm') {
        styles.padding = '0.5rem 1rem';
        styles.fontSize = '0.875rem';
    } else if (size === 'md') {
        styles.padding = '0.75rem 1.5rem';
        styles.fontSize = '1rem';
    } else if (size === 'lg') {
        styles.padding = '1rem 2rem';
        styles.fontSize = '1.125rem';
    }

    // Variant styles
    if (variant === 'primary') {
        styles.background = 'var(--brand-primary)';
        styles.color = 'white';
        styles.boxShadow = 'var(--shadow-md)';
    } else if (variant === 'secondary') {
        styles.background = 'var(--bg-dark)';
        styles.color = 'white';
    } else if (variant === 'outline') {
        styles.background = 'transparent';
        styles.color = 'var(--brand-primary)';
        styles.border = '2px solid var(--brand-primary)';
    } else if (variant === 'glass') {
        styles.background = 'rgba(255, 255, 255, 0.2)';
        styles.backdropFilter = 'blur(10px)';
        styles.WebkitBackdropFilter = 'blur(10px)';
        styles.border = '1px solid rgba(255, 255, 255, 0.3)';
        styles.color = 'var(--text-primary)';
        styles.boxShadow = 'var(--shadow-glass)';
    }

    const handleMouseOver = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        if (variant === 'primary') {
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            e.currentTarget.style.background = 'var(--brand-primary-hover)';
        }
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'translateY(0)';
        if (variant === 'primary') {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.background = 'var(--brand-primary)';
        }
    };

    if (href) {
        return (
            <Link
                href={href}
                style={styles}
                className={className}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            style={styles}
            className={className}
            onClick={disabled ? undefined : onClick}
            onMouseOver={disabled ? undefined : handleMouseOver}
            onMouseOut={disabled ? undefined : handleMouseOut}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
