"use client";

import React, { useState } from 'react';
import Button from './Button';

interface SubscriptionButtonProps {
    tier: 'guardian-pilot' | 'growth-lattice' | 'network-core';
    label?: string;
    variant?: 'primary' | 'outline' | 'glass';
    style?: React.CSSProperties;
    fullWidth?: boolean;
}

export default function SubscriptionButton({
    tier,
    label,
    variant = 'primary',
    style,
    fullWidth = true
}: SubscriptionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        if (tier === 'network-core') {
            window.location.href = 'mailto:joehary@northstarmedic.com';
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier })
            });

            if (!res.ok) throw new Error('Failed to create checkout session');

            const { url } = await res.json();
            window.location.href = url;
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Failed to initialize Stripe engine. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSubscribe}
            variant={variant}
            fullWidth={fullWidth}
            style={style}
            disabled={isLoading}
        >
            {isLoading ? 'Connecting Stripe Engine...' : (label || `Select ${tier}`)}
        </Button>
    );
}
