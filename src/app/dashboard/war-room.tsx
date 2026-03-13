import React from 'react';

export default function WarRoomDashboard() {
  const stats = {
    activeClaims: 847,
    totalRecovered: 47200000,
    clinicsOnboarded: 156,
    conversionRate: 8.3,
    avgRecovery: 55700,
    closureRate: 34,
    pipelineValue: 285000000,
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

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f1535 100%)', color: 'white', padding: '2rem' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b-2" style={{ borderColor: 'rgba(0, 212, 255, 0.3)', paddingBottom: '2rem' }}>
          <h1 className="text-4xl font-black mb-2" style={{ 
            background: 'linear-gradient(135deg, #00d4ff, #ff1a7a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ⚡ WAR ROOM COMMAND CENTER
          </h1>
          <p className="text-gray-400">Real-time claims recovery • Last update: {stats.lastUpdate}</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Recovered', value: `$${(stats.totalRecovered / 1000000).toFixed(1)}M`, icon: '💰', color: '#00d4ff' },
            { label: 'Active Claims', value: stats.activeClaims, icon: '📋', color: '#00f0ff' },
            { label: 'Clinics Onboarded', value: stats.clinicsOnboarded, icon: '🏥', color: '#ff1a7a' },
            { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: '📈', color: '#00d4ff' },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl p-6 backdrop-blur" style={{
              border: `2px solid ${kpi.color}33`,
              background: `linear-gradient(135deg, ${kpi.color}08, transparent)`,
              boxShadow: `0 0 20px ${kpi.color}20`
            }}>
              <div className="text-3xl mb-2">{kpi.icon}</div>
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">{kpi.label}</div>
              <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Wins */}
          <div className="rounded-2xl p-8 backdrop-blur" style={{
            border: '2px solid rgba(0, 212, 255, 0.2)',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), transparent)'
          }}>
            <h2 className="text-2xl font-black mb-6" style={{ color: '#00d4ff' }}>🏆 Recent Wins</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentWins.map((win, i) => (
                <div key={i} className="rounded-lg p-4 flex justify-between items-center" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div>
                    <div className="font-bold">{win.clinic}</div>
                    <div className="text-sm text-gray-400">{win.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: '#00f0ff' }}>${(win.recovery / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-gray-400">{win.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="rounded-2xl p-8 backdrop-blur" style={{
            border: '2px solid rgba(255, 26, 122, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 26, 122, 0.05), transparent)'
          }}>
            <h2 className="text-2xl font-black mb-6" style={{ color: '#ff1a7a' }}>🤖 Top Performers</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topPerformers.map((agent, i) => (
                <div key={i} className="rounded-lg p-4" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255, 26, 122, 0.1)'
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">{agent.name}</div>
                    <div className="text-sm" style={{ color: '#ff1a7a' }}>ACE: {agent.accuracy}</div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: '#00d4ff' }}>${(agent.recovered / 1000000).toFixed(1)}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl" style={{
          background: 'rgba(0, 212, 255, 0.05)',
          border: '2px solid rgba(0, 212, 255, 0.2)'
        }}>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">Avg Recovery</div>
            <div className="text-2xl font-bold" style={{ color: '#00d4ff' }}>${(stats.avgRecovery / 1000).toFixed(0)}k</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">Closure Rate</div>
            <div className="text-2xl font-bold" style={{ color: '#00f0ff' }}>{stats.closureRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">Pipeline Value</div>
            <div className="text-2xl font-bold" style={{ color: '#ff1a7a' }}>${(stats.pipelineValue / 1000000).toFixed(0)}M</div>
          </div>
        </div>

      </div>
    </div>
  );
}

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
