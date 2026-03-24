import Button from "@/components/Button";
import FeatureCard from "@/components/FeatureCard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works | NorthStar Medic",
};

export default function FeaturesPage() {
    return (
        <>
            <section className="section-padding" style={{ background: "var(--bg-secondary)", paddingTop: "8rem" }}>
                <div className="container text-center">
                    <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "1.5rem" }}>
                        The Engine That Recovers Your <span className="text-gradient">Lost Revenue</span>
                    </h1>
                    <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 3rem" }}>
                        You focus on patients. We focus on getting you paid for them. Our proprietary system instantly cross-references your denied claims against current payer guidelines to find exactly where the money was left on the table—and recovers it for you automatically.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem, 4vw, 4rem)", alignItems: "center" }}>
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Zero-Touch Appeals</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginBottom: "1.5rem" }}>
                                Don't waste your staff's valuable time fighting on hold with insurance companies. Once our system identifies recoverable revenue, it autonomously drafts legally structured appeal letters and handles the entire submission process for you.
                            </p>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                                <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}><span style={{ color: "var(--brand-accent)" }}>✔</span> Save hundreds of hours of administrative billing work</li>
                                <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}><span style={{ color: "var(--brand-accent)" }}>✔</span> No upfront software costs or hourly legal fees</li>
                                <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}><span style={{ color: "var(--brand-accent)" }}>✔</span> Turn your denied claims into cash while you sleep</li>
                            </ul>
                        </div>
                        <div className="glass-panel" style={{ padding: "2rem", minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ background: "rgba(37,99,235,0.05)", padding: "1.5rem", borderRadius: "1rem", borderLeft: "4px solid var(--brand-primary)" }}>
                                <h4 style={{ marginBottom: "0.5rem" }}>Appeal Drafted: Claim ID #99281X</h4>
                                <p style={{ fontSize: "0.875rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                    "...pursuant to CMS guideline chapter 12, procedure code 93010 was inappropriately unbundled by the payer. Appended modifier 59 is justified by the distinct procedural service..."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: "var(--bg-primary)" }}>
                <div className="container text-center">
                    <h2 style={{ fontSize: "2rem", marginBottom: "3rem" }}>Ready to recover your denied revenue?</h2>
                    <Button href="/pricing" size="lg">View Pricing Plans</Button>
                </div>
            </section>
        </>
    );
}
