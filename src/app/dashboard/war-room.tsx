import React from 'react';

export default function WarRoomDashboard() {
  const stats = {
    activeClaims: 847,
    totalRecovered: 47200000,
    clinicsOnboarded: 156,
    conversionRate: 8.3,
    avgRecovery: 55700,
    closureRate: 34,
    piplineValue: 285000000,
    lastUpdate: new Date().toLocaleTimeString()
  };

  const recentWins = [
    { clinic: 'Memorial Healthcare System', recovery: 487000, date: 'Today', status: 'Recovered' },
    { clinic: 'Baylor St. Luke\'s Medical Center', recovery: 1240000, date: 'Yesterday', status: 'Recovered' },
    { clinic: 'HCA Houston Healthcare', recovery: 623000, date: '2 days ago', status: 'Appeal Pending' },
    { clinic: 'Baptist Health System', recovery: 892000, date: '3 days ago', status: 'Recovered' },
    { clinic: 'Texas Medical Center', recovery: 356000, date: '4 days ago', status: 'Recovered' }
  ];

  const topPerformers = [
    { name: 'Agent 41 (Master)', recovered: 18900000, accuracy: '96%' },
    { name: 'Clinical Grid (Agents 8-14)', recovered: 12400000, accuracy: '94%' },
    { name: 'Legal Defense (Agents 20-32)', recovered: 9680000, accuracy: '91%' },
    { name: 'Strategic Partners (Agents 33-50)', recovered: 6220000, accuracy: '88%' }
  ];

  const regions = [
    { name: 'Texas', claims: 456, recovered: 28400000, conversion: 9.2 },
    { name: 'Florida', claims: 234, recovered: 12800000, conversion: 7.8 },
    { name: 'California', claims: 157, recovered: 6000000, conversion: 6.4 }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '2000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', borderBottom: '2px solid rgba(0,242,255,0.2)', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '5px', background: 'linear-gradient(135deg, #00f2ff, #7000ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ⚙️ WAR ROOM COMMAND CENTER
          </h1>
          <p style={{ color: '#888', margin: 0 }}>Real-time claims recovery monitoring • Last update: {stats.lastUpdate}</p>
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Recovered', value: `$${(stats.totalRecovered / 1000000).toFixed(1)}M`, icon: '💰', color: '#00f2ff' },
            { label: 'Active Claims', value: stats.activeClaims, icon: '📋', color: '#10b981' },
            { label: 'Clinics Onboarded', value: stats.clinicsOnboarded, icon: '🏥', color: '#f59e0b' },
            { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: '📈', color: '#8b5cf6' },
            { label: 'Avg Recovery', value: `$${(stats.avgRecovery / 1000).toFixed(0)}k`, icon: '💵', color: '#ec4899' },
            { label: 'Closure Rate', value: `${stats.closureRate}%`, icon: '✅', color: '#06b6d4' },
            { label: 'Pipeline Value', value: `$${(stats.piplineValue / 1000000).toFixed(0)}M`, icon: '🎯', color: '#14b8a6' },
            { label: 'Monthly Burn', value: '$0', icon: '🔥', color: '#f87171' }
          ].map((kpi, i) => (
            <div key={i} style={{ 
              background: 'rgba(0,242,255,0.05)',
              border: `2px solid ${kpi.color}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: `0 0 20px ${kpi.color}33`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>{kpi.icon}</div>
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          {/* Recent Wins */}
          <div style={{ background: 'rgba(0,242,255,0.03)', border: '2px solid rgba(0,242,255,0.2)', borderRadius: '16px', padding: '30px', boxShadow: '0 0 40px rgba(0,242,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00f2ff' }}>🏆 RECENT WINS</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {recentWins.map((win, i) => (
                <div key={i} style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(0,242,255,0.1)',
                  borderRadius: '8px',
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{win.clinic}</div>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>{win.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>${(win.recovery / 1000).toFixed(0)}k</div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{win.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top AI Agents */}
          <div style={{ background: 'rgba(112,0,255,0.03)', border: '2px solid rgba(112,0,255,0.2)', borderRadius: '16px', padding: '30px', boxShadow: '0 0 40px rgba(112,0,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#a78bfa' }}>🤖 TOP AI AGENTS</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {topPerformers.map((agent, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(112,0,255,0.1)',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{agent.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#aaa' }}>
                    <span>Recovered: <span style={{ color: '#10b981', fontWeight: 'bold' }}>${(agent.recovered / 1000000).toFixed(1)}M</span></span>
                    <span>Accuracy: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{agent.accuracy}</span></span>
                  </div>
                  <div style={{ marginTop: '8px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #a78bfa, #7000ff)', width: `${parseInt(agent.accuracy)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Performance */}
        <div style={{ background: 'rgba(16,185,129,0.03)', border: '2px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '30px', marginBottom: '40px', boxShadow: '0 0 40px rgba(16,185,129,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#10b981' }}>📍 REGIONAL PERFORMANCE</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {regions.map((region, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#10b981' }}>{region.name}</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                  <div><span style={{ color: '#888' }}>Claims:</span> <span style={{ fontWeight: 'bold' }}>{region.claims}</span></div>
                  <div><span style={{ color: '#888' }}>Recovered:</span> <span style={{ color: '#10b981', fontWeight: 'bold' }}>${(region.recovered / 1000000).toFixed(1)}M</span></div>
                  <div><span style={{ color: '#888' }}>Conversion:</span> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{region.conversion}%</span></div>
                </div>
                <div style={{ marginTop: '12px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#10b981', width: `${region.conversion * 10}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Pipeline */}
        <div style={{ background: 'rgba(245,158,11,0.03)', border: '2px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '30px', boxShadow: '0 0 40px rgba(245,158,11,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#f59e0b' }}>📊 SALES PIPELINE</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { stage: 'Prospect', count: 1245, value: '$85M', color: '#3b82f6' },
              { stage: 'Demo Scheduled', count: 347, value: '$65M', color: '#8b5cf6' },
              { stage: 'Negotiating', count: 89, value: '$78M', color: '#f59e0b' },
              { stage: 'Ready to Close', count: 23, value: '$57M', color: '#10b981' }
            ].map((stage, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${stage.color}`,
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '8px' }}>{stage.stage}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stage.color, marginBottom: '8px' }}>{stage.count}</div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Value: <span style={{ color: stage.color, fontWeight: 'bold' }}>{stage.value}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
