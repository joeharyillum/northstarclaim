"use client";

import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    delay?: number;
}

export default function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
    return (
        <div
            className="glass-panel animate-fade-in"
            style={{
                padding: "2.5rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                transition: "all var(--transition-normal)",
                animationDelay: `${delay}ms`,
                cursor: "default"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-glass)";
            }}
        >
            {icon && (
                <div style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.1))",
                    color: "var(--brand-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem"
                }}>
                    {icon}
                </div>
            )}

            <h3 style={{ fontSize: "1.25rem" }}>{title}</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{description}</p>
        </div>
    );
}
