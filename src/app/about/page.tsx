import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, Target, Lock, Activity, CheckCircle2, Building, Scale, Clock, Handshake, Network } from 'lucide-react';
import Button from '@/components/Button';

export const metadata: Metadata = {
    title: 'About Us | Northstar',
    description: 'Our Company Profile, Mission, and Rules & Regulations.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#03050a] text-white selection:bg-[#00f2ff]/30 pb-20">
            {/* Hero Section */}
            <div className="relative pt-32 pb-24 overflow-hidden border-b border-white/5 bg-[#060910]/40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#00f2ff]/10 to-transparent blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-full text-[#00f2ff] text-xs font-black uppercase tracking-widest mb-6">
                        <Building size={14} /> Corporate Profile
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-6 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                        The Northstar <span className="text-[#00f2ff]">Directive</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Forged from frustration with the $260B unclaimed medical revenue crisis. We are the elite recovery grid bridging healthcare and sovereign capital.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-8 py-16 space-y-24">

                {/* Our Origins & Why We Exist */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-emerald-400 mb-4">
                            <Zap size={24} />
                            <h2 className="text-xs font-black uppercase tracking-[0.3em]">Origin Story</h2>
                        </div>
                        <h3 className="text-4xl font-black italic uppercase leading-none">How the <span className="text-emerald-400">Idea</span> Started</h3>
                        <p className="text-slate-400 text-lg leading-loose">
                            Our company was founded when we witnessed independent medical clinics and healthcare providers drowning under the crushing weight of insurance payer denials. Hardworking practitioners were rendering care but losing out on millions due to arbitrary bureaucratic roadblocks.
                        </p>
                        <p className="text-slate-400 text-lg leading-loose">
                            We saw an asymmetrical war: Insurance giants had armies of auditors; clinics had stretched billing teams. <strong>We built Northstar to level the playing field.</strong> By combining military-grade AI neural networks with aggressive legal expertise, we created a system that automatically audits, drafts, and forces settlement of denied claims. Our mission is to restore the balance of power back to the provider.
                        </p>
                    </div>

                    <div className="p-10 border border-white/10 bg-white/[0.02] rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-[#00f2ff] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <Activity size={32} className="text-white" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black uppercase italic">Unmatched Trust</h4>
                                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mt-1">Fortune 500 Infrastructure</p>
                            </div>
                        </div>
                        <ul className="space-y-4 relative z-10">
                            {[
                                "A+ Rating & Vertically Integrated Audit Nodes",
                                "Deployed across leading US Clinical Networks",
                                "HIPAA Compliant & Covered under comprehensive BAAs",
                                "94.2% Success Rate on Target Claim Recoveries"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* The Win-Win Partnership */}
                <section className="p-12 border border-[#00f2ff]/20 bg-gradient-to-br from-[#00f2ff]/5 to-transparent rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00f2ff]/20 blur-[120px]"></div>

                    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                        <Handshake size={48} className="text-[#00f2ff] mx-auto" />
                        <h3 className="text-4xl md:text-5xl font-black italic uppercase">Why Use Our Grid? <br /> <span className="text-[#00f2ff]">The Win-Win Advantage</span></h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-12">
                            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl">
                                <h4 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Network className="text-[#00f2ff]" /> Hyper-Lean Cash Flow</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    Traditional RCM processes tie up capital and take months. Our software analyzes your claim data almost instantaneously. It injects a "lean cash flow" model directly into your operations, bypassing delays and immediately locating pure profit that was otherwise lost to the void.
                                </p>
                            </div>
                            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl">
                                <h4 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Clock className="text-emerald-400" /> 48-Hour Processing Window</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    Speed is currency. Once your historical data enters the Northstar ingestion node, our systems process, audit, and route appeals directly to payer portals. <strong>The entire initial ingestion and analysis process takes about 48 hours.</strong> Faster execution means faster settlements.
                                </p>
                            </div>
                        </div>

                        <p className="text-xl text-slate-300 font-medium pt-8 max-w-2xl mx-auto border-t border-white/10">
                            We operate purely on a performance basis. We only profit when you recover your money. It's the ultimate symbiotic business model. <span className="text-[#00f2ff] font-bold">Your victory is our revenue.</span>
                        </p>
                    </div>
                </section>

                {/* Rules and Regulations */}
                <section className="space-y-12">
                    <div className="text-center space-y-4">
                        <Scale size={40} className="text-[#7B61FF] mx-auto mb-6" />
                        <h2 className="text-4xl font-black uppercase italic">Rules & <span className="text-[#7B61FF]">Regulations</span></h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            To maintain the integrity of our Fortune 500-grade network, all partners and clients must adhere strictly to our operational guidelines.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Data Integrity & HIPAA Compliance",
                                text: "All data submitted to the recovery grid must be compliant with the Health Insurance Portability and Accountability Act (HIPAA) as amended through 2026. All Protected Health Information (PHI) is encrypted at rest (AES-256) and in transit (TLS 1.3). Modifying or falsifying diagnostic codes prior to neural ingestion will result in immediate API key revocation and regulatory referral. Business Associate Agreements (BAAs) are executed digitally prior to any data processing.",
                                icon: <Shield className="text-[#7B61FF]" />
                            },
                            {
                                title: "Zero Fraud Tolerance & Compliance",
                                text: "The network audits claims exclusively to recover legally owed revenue. Any attempt to use the platform for upcoding, unbundling, or submitting phantom claims is strictly prohibited and automatically flagged by our AI compliance layer. Violations are reported to the OIG (Office of Inspector General) and CMS. All recovery activities comply with the False Claims Act (31 U.S.C. \u00a7\u00a7 3729\u20133733), Anti-Kickback Statute, and Stark Law.",
                                icon: <Lock className="text-[#7B61FF]" />
                            },
                            {
                                title: "Commission & Revenue Settlement Schedule",
                                text: "Commissions are calculated solely on realized, verified recoveries deposited into the provider\u2019s designated financial account. Standard commission is 30% for direct clients and 15% for biller-referred partners. All payouts are processed via Stripe Connect with full audit trail. Partners must maintain active verified bank accounts or Stripe payment gateways. Withholding verified recovery payouts beyond 30 days will initiate automated legal escalation per the signed Performance Partnership Agreement.",
                                icon: <Building className="text-[#7B61FF]" />
                            },
                            {
                                title: "48-Hour SLA & Processing Guarantee",
                                text: "Upon bulk PDF, CSV, or FHIR API data submission, the NorthStar engine guarantees a 48-hour initial analysis window. Users must not interrupt or double-submit files during active scanning. If initial analysis is not delivered within 48 hours, the setup fee (if applicable) is fully refundable. All processing occurs on HIPAA-compliant infrastructure (SOC 2 Type II certified) within US-based data centers.",
                                icon: <Clock className="text-[#7B61FF]" />
                            },
                            {
                                title: "Web 4.0 Autonomous Agent Disclosure",
                                text: "NorthStar Claim operates as a Web 4.0 compliant autonomous agent platform. AI agents make decisions within defined parameters but all final settlement approvals above $50,000 require human authorization. Agent actions are fully auditable with immutable blockchain-anchored logs. The platform complies with emerging AI governance frameworks including the EU AI Act and proposed US AI regulatory standards.",
                                icon: <Target className="text-[#7B61FF]" />
                            },
                            {
                                title: "Termination & Data Retention Policy",
                                text: "Either party may terminate the agreement with 30 days written notice. Upon termination, all PHI data is securely wiped within 72 hours per NIST SP 800-88 standards, with a Certificate of Destruction provided. Active claims in-process at time of termination will be completed, and any resulting recoveries will be subject to the agreed commission structure. Audit logs are retained for 7 years per HIPAA requirements.",
                                icon: <Scale className="text-[#7B61FF]" />
                            }
                        ].map((rule, idx) => (
                            <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all rounded-3xl group">
                                <div className="w-12 h-12 bg-[#7B61FF]/10 text-[#7B61FF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {rule.icon}
                                </div>
                                <h4 className="text-lg font-bold text-white mb-3">{rule.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{rule.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final Call to Action */}
                <div className="text-center pt-16 border-t border-white/10">
                    <h2 className="text-3xl font-black italic uppercase mb-8">Ready to Restore Your <span className="text-[#00f2ff]">Revenue Pipeline?</span></h2>
                    <div className="flex justify-center gap-6">
                        <Link
                            href="/free-scan"
                            className="px-8 py-4 bg-[#00f2ff] text-black text-sm font-black uppercase tracking-widest rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                        >
                            Initiate Free Scan
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-white/5 text-white border border-white/10 text-sm font-black uppercase tracking-widest rounded-full hover:bg-white/10 transition-all"
                        >
                            Enter Dashboard
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
