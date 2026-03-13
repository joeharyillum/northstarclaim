export default function PricingPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Simple, Transparent Pricing</h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
          Pay only when we recover your denied claims. No upfront fees. No monthly subscriptions.
        </p>
      </section>

      {/* Pricing Cards */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {/* Card 1 */}
          <div style={{ border: '1px solid #333', borderRadius: '12px', padding: '40px', background: '#111' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Pilot Audit</h3>
            <p style={{ color: '#888', marginBottom: '25px' }}>Perfect to start</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00f2ff', marginBottom: '25px' }}>$0</div>
            <ul style={{ textAlign: 'left', color: '#ccc', lineHeight: '2.2', marginBottom: '30px' }}>
              <li>✓ 24-Hour Denial Scan</li>
              <li>✓ 500 Claims Review</li>
              <li>✓ 15% Recovery Fee</li>
              <li>✓ No BAA Required</li>
            </ul>
            <a href="/signup" style={{ display: 'block', padding: '12px', border: '1px solid #00f2ff', borderRadius: '8px', textAlign: 'center', color: '#00f2ff', textDecoration: 'none' }}>Start Free Audit</a>
          </div>

          {/* Card 2 - Featured */}
          <div style={{ border: '2px solid #00f2ff', borderRadius: '12px', padding: '40px', background: 'rgba(0,242,255,0.05)', boxShadow: '0 0 30px rgba(0,242,255,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #00f2ff, #7000ff)', color: '#000', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '15px', width: 'fit-content' }}>⭐ MOST POPULAR</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#00f2ff' }}>Performance Partner</h3>
            <p style={{ color: '#888', marginBottom: '25px' }}>Unlimited recovery scale</p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00f2ff', marginBottom: '25px' }}>30%</div>
            <p style={{ color: '#888', marginBottom: '25px' }}>Of recovered funds</p>
            <ul style={{ textAlign: 'left', color: '#ccc', lineHeight: '2.2', marginBottom: '30px' }}>
              <li>✓ $0 Monthly Fees</li>
              <li>✓ Unlimited Claims</li>
              <li>✓ Full HIPAA/BAA</li>
              <li>✓ Multi-Level Appeals</li>
              <li>✓ Automated Process</li>
            </ul>
            <a href="/signup" style={{ display: 'block', padding: '12px', background: 'linear-gradient(135deg, #00f2ff, #7000ff)', borderRadius: '8px', textAlign: 'center', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>Start Recovery Now</a>
          </div>

          {/* Card 3 */}
          <div style={{ border: '1px solid #333', borderRadius: '12px', padding: '40px', background: '#111' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Enterprise Grid</h3>
            <p style={{ color: '#888', marginBottom: '25px' }}>For large networks</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff007a', marginBottom: '25px' }}>Custom</div>
            <ul style={{ textAlign: 'left', color: '#ccc', lineHeight: '2.2', marginBottom: '30px' }}>
              <li>✓ Custom EHR Integration</li>
              <li>✓ Dedicated Support</li>
              <li>✓ Volume Pricing</li>
              <li>✓ White-Label Option</li>
              <li>✓ SLA Guarantees</li>
            </ul>
            <a href="/contact" style={{ display: 'block', padding: '12px', border: '1px solid #ff007a', borderRadius: '8px', textAlign: 'center', color: '#ff007a', textDecoration: 'none' }}>Contact Sales</a>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section style={{ background: 'rgba(0,242,255,0.05)', padding: '60px 20px', borderTop: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2rem' }}>Average Results</h2>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00f2ff', marginBottom: '10px' }}>$147K</div>
            <p style={{ color: '#aaa' }}>Avg Recovery/Year</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>50-bed clinic</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00f2ff', marginBottom: '10px' }}>34 days</div>
            <p style={{ color: '#aaa' }}>Time to First Recovery</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00f2ff', marginBottom: '10px' }}>4.2x</div>
            <p style={{ color: '#aaa' }}>Average ROI (12 months)</p>
          </div>
        </div>
      </section>

      {/* Partner Program */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ border: '2px solid rgba(0,242,255,0.3)', borderRadius: '12px', padding: '40px', background: 'rgba(0,242,255,0.02)' }}>
          <h2 style={{ marginBottom: '20px' }}>50/50 Partner Program</h2>
          <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '25px' }}>
            Refer clinics to our platform and earn 50% commission on every successful recovery. Zero setup costs, instant Stripe payouts, truly passive income.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>💸 Zero Cost</h4>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No fees. Only earn commission on success.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>⚡ Instant Payouts</h4>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Stripe automatically pays you within 48 hours.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>📈 Truly Passive</h4>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Refer once, earn forever on every recovery.</p>
            </div>
          </div>
          <a href="/partner" style={{ display: 'inline-block', marginTop: '30px', padding: '12px 24px', background: '#00f2ff', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Join Partner Program</a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2rem' }}>FAQ</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
            <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>When do we get paid?</h4>
            <p style={{ color: '#aaa' }}>You only pay our fee when we successfully recover your claim. Never if we fail.</p>
          </div>
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
            <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>Is this HIPAA compliant?</h4>
            <p style={{ color: '#aaa' }}>Yes. Full HIPAA compliance and BAA agreements included with Performance Partner and Enterprise tiers.</p>
          </div>
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
            <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>How long until first recovery?</h4>
            <p style={{ color: '#aaa' }}>Average is 34 days from claim submission to first successful recovery payment.</p>
          </div>
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
            <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>Can we cancel anytime?</h4>
            <p style={{ color: '#aaa' }}>Yes. No contracts, no commitments. Cancel instantly if you are not satisfied.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 20px 80px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '2.5rem' }}>Ready to Recover Your Denied Claims?</h2>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>Start with a free 24-hour audit. No credit card required.</p>
        <a href="/signup" style={{ display: 'inline-block', padding: '15px 40px', background: 'linear-gradient(135deg, #00f2ff, #7000ff)', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Start Free Audit Now</a>
      </section>
    </main>
  );
}
