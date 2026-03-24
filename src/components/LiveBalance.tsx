"use client";

import { useState, useEffect } from "react";

export default function LiveBalance() {
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await fetch("/api/stripe/balance");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.total !== undefined) {
                        setBalance(data.total);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch balance", error);
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
            {balance !== null ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Syncing..."}
        </div>
    );
}
