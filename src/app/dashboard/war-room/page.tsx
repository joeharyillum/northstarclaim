"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Zap, Activity, Target, Award, Gauge, Clock, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  accent: string;
};

type PipelineCardProps = {
  stage: string;
  count: string;
  rate: string;
  icon: LucideIcon;
  color: string;
};

type StatRowProps = {
  label: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: string;
};

export default function WarRoomDashboard() {
  const [data, setData] = useState({
    totalRecovered: 47200000,
    activeClaims: 847,
    clinicsOnboarded: 156,
    recoveryRate: 94.2,
    avgExtraction: "45m",
    upfrontCost: 0,
    neuralNodesOnline: 15000000,
    successfulAppeals: 3219,
    rejectionRate: 5.8,
    avgClaimValue: 55700,
    pendingClaims: 142,
    totalClinicsServed: 156,
  });

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const MetricCard = ({ icon: Icon, label, value, subtext, color, accent }: MetricCardProps) => (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-950 p-6 backdrop-blur-xl transition-all duration-500 hover:border-gray-600 hover:from-gray-900 hover:to-gray-900">
      {/* Gradient glow background */}
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">LIVE</div>
        </div>
        
        <p className="text-sm font-semibold text-gray-300 mb-2">{label}</p>
        <p className={`text-3xl font-black mb-1 ${animate ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
          {value}
        </p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${accent}`}></div>
    </div>
  );

  const PipelineCard = ({ stage, count, rate, icon: Icon, color }: PipelineCardProps) => (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-700/30 bg-gray-800/30 backdrop-blur hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-200">{stage}</p>
        <p className="text-xs text-gray-400">{count} claims</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-white">{rate}</p>
        <p className="text-xs text-gray-400">conversion</p>
      </div>
    </div>
  );

  const StatRow = ({ label, value, change, icon: Icon, color }: StatRowProps) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-700/20 bg-gray-800/20">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="text-right">
        <p className="font-bold text-white">{value}</p>
        <p className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">System Status: OPTIMAL</span>
        </div>
        <h1 className="text-5xl font-black mb-2">War Room Command Center</h1>
        <p className="text-gray-400">Real-time recovery grid monitoring across {data.totalClinicsServed} healthcare systems</p>
      </div>

      {/* Primary KPIs - Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          icon={DollarSign} 
          label="Total Recovered" 
          value={`$${(data.totalRecovered / 1000000).toFixed(1)}M`}
          subtext="+$2.3M this week"
          color="bg-gradient-to-br from-emerald-600 to-teal-600"
          accent="bg-gradient-to-r from-emerald-600/20 to-transparent"
        />
        <MetricCard 
          icon={Users} 
          label="Active Claims" 
          value={data.activeClaims.toLocaleString()}
          subtext="High-priority: 89"
          color="bg-gradient-to-br from-blue-600 to-cyan-600"
          accent="bg-gradient-to-r from-blue-600/20 to-transparent"
        />
        <MetricCard 
          icon={Award} 
          label="Success Rate" 
          value={`${data.recoveryRate}%`}
          subtext="Industry avg: 52%"
          color="bg-gradient-to-br from-purple-600 to-pink-600"
          accent="bg-gradient-to-r from-purple-600/20 to-transparent"
        />
        <MetricCard 
          icon={Zap} 
          label="Clinics Onboarded" 
          value={data.clinicsOnboarded}
          subtext="+12 this month"
          color="bg-gradient-to-br from-orange-600 to-red-600"
          accent="bg-gradient-to-r from-orange-600/20 to-transparent"
        />
      </div>

      {/* Sales Pipeline & Performance Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Pipeline */}
        <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Sales Pipeline Overview
          </h3>
          <div className="space-y-3">
            <PipelineCard 
              stage="Leads Generated" 
              count="2,847" 
              rate="32.1%" 
              icon={Target}
              color="bg-blue-600/20"
            />
            <PipelineCard 
              stage="Qualified Prospects" 
              count="912" 
              rate="64.7%" 
              icon={CheckCircle2}
              color="bg-green-600/20"
            />
            <PipelineCard 
              stage="Negotiations" 
              count="285" 
              rate="89.5%" 
              icon={Gauge}
              color="bg-purple-600/20"
            />
            <PipelineCard 
              stage="Closed Deals" 
              count="256" 
              rate="92.3%" 
              icon={Award}
              color="bg-emerald-600/20"
            />
          </div>
        </div>

        {/* Real-Time Metrics */}
        <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Performance Metrics
          </h3>
          <div className="space-y-3">
            <StatRow 
              label="Avg Claim Value" 
              value={`$${data.avgClaimValue.toLocaleString()}`}
              change={12.5}
              icon={DollarSign}
              color="bg-green-600/20"
            />
            <StatRow 
              label="Appeal Success Rate" 
              value={`${data.recoveryRate}%`}
              change={5.8}
              icon={Percent}
              color="bg-purple-600/20"
            />
            <StatRow 
              label="Avg Processing Time" 
              value={data.avgExtraction}
              change={-8.2}
              icon={Clock}
              color="bg-blue-600/20"
            />
            <StatRow 
              label="Pending Reviews" 
              value={data.pendingClaims}
              change={-2.3}
              icon={AlertCircle}
              color="bg-orange-600/20"
            />
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur p-6">
          <h3 className="text-lg font-bold mb-6">Weekly Recovery Trend</h3>
          <div className="space-y-4">
            {[
              { day: "Monday", amount: 847, bars: 8 },
              { day: "Tuesday", amount: 923, bars: 9 },
              { day: "Wednesday", amount: 756, bars: 7 },
              { day: "Thursday", amount: 1032, bars: 10 },
              { day: "Friday", amount: 1248, bars: 12 },
              { day: "Saturday", amount: 621, bars: 6 },
              { day: "Sunday", amount: 742, bars: 7 },
            ].map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-400 w-20">{day.day}</span>
                <div className="flex-1 flex gap-1 items-center">
                  {Array(12).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded transition-all duration-500 ${
                        i < day.bars
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gray-700/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-emerald-400 w-24 text-right">${(day.amount * 55700 / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur p-6">
          <h3 className="text-lg font-bold mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-700/30 p-4 bg-gray-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">API Uptime</span>
                <span className="text-sm font-bold text-green-400">99.98%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-2 rounded-full" style={{ width: '99.98%' }}></div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-700/30 p-4 bg-gray-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Database Health</span>
                <span className="text-sm font-bold text-green-400">Optimal</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-700/30 p-4 bg-gray-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Cache Hit Ratio</span>
                <span className="text-sm font-bold text-blue-400">87.3%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full" style={{ width: '87.3%' }}></div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-700/30 p-4 bg-gray-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Active Agents</span>
                <span className="text-sm font-bold text-purple-400">42/42</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-400 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Clinics */}
      <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur p-6">
        <h3 className="text-lg font-bold mb-6">Top Performing Healthcare Systems</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Mount Sinai", recovered: 8420000, appeals: 847, rate: "96.2%" },
            { name: "Mayo Clinic", recovered: 6850000, appeals: 612, rate: "94.8%" },
            { name: "Cleveland Clinic", recovered: 5920000, appeals: 543, rate: "93.1%" },
            { name: "Kaiser Permanente", recovered: 7340000, appeals: 725, rate: "95.4%" },
          ].map((clinic) => (
            <div key={clinic.name} className="rounded-xl border border-gray-700/30 bg-gray-800/30 p-4 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300">
              <p className="font-semibold text-sm mb-3">{clinic.name}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recovered:</span>
                  <span className="font-bold text-emerald-400">${(clinic.recovered / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="font-bold text-blue-400">{clinic.rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Appeals Won:</span>
                  <span className="font-bold text-purple-400">{clinic.appeals}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
