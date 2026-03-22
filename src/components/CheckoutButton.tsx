"use client";

export default function CheckoutButton({ tier, label, variant, directUrl }: { tier: string; label: string; variant: "outline" | "gradient"; directUrl?: string }) {
    const handleCheckout = async () => {
        if (directUrl) {
            window.location.href = directUrl;
            return;
        }
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Stripe link creation failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Checkout unreachable');
        }
    };

    const style = variant === "gradient"
        ? { display: "block", width: "100%", padding: "0.85rem", background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", borderRadius: "var(--radius-lg)", textAlign: "center" as const, color: "#000", border: "none", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", fontSize: "1rem" }
        : { display: "block", width: "100%", padding: "0.85rem", border: "1px solid var(--brand-primary)", borderRadius: "var(--radius-lg)", textAlign: "center" as const, color: "var(--brand-primary)", background: "transparent", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontSize: "1rem" };

    return (
        <button onClick={handleCheckout} style={style}>
            {label}
        </button>
    );
}

