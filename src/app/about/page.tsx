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
                                "35–40% Recovery Success Rate on Denied Claims"
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
                                text: "All data submitted to the recovery grid must be compliant with the Health Insurance Portability and Accountability Act. Modifying or falsifying diagnostic codes prior to neural ingestion will result in immediate API termination.",
                                icon: <Shield className="text-[#7B61FF]" />
                            },
                            {
                                title: "Zero Fraud Tolerance",
                                text: "The network audits claims to recover legally owed revenue. Any attempt to use the platform for upcoding, unbundling, or submitting phantom claims is strictly prohibited and flagged for regulatory review.",
                                icon: <Lock className="text-[#7B61FF]" />
                            },
                            {
                                title: "Commission Settlement Schedule",
                                text: "Commissions are strictly calculated based on realized recoveries hitting the provider's corporate vault. Partners must keep Stripe or banking gateways synced. Withholding verified recovery payouts will initiate automatic legal escalation.",
                                icon: <Building className="text-[#7B61FF]" />
                            },
                            {
                                title: "48-Hour SLA Acknowledgment",
                                text: "Upon bulk PDF or API data submission, the Northstar engine promises a 48-hour processing window for initial analysis. Users must not interrupt or double-submit files during this active scanning phase.",
                                icon: <Clock className="text-[#7B61FF]" />
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
