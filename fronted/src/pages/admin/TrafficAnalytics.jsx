import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, MousePointer2, TrendingUp, Globe, Smartphone, 
  Monitor, ChevronUp, ChevronDown, Activity, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const TrafficAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics/stats');
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="analytics-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner"></div>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  const { summary, visitsTimeline, referrers, devices } = data;

  const COLORS = ['#C2006A', '#00A699', '#FFB400', '#484848', '#767676'];

  return (
    <div className="analytics-container" style={{ paddingBottom: '2rem' }}>
      <div className="analytics-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Traffic Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time overview of your website traffic and conversion performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="analytics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="analytics-card" 
          style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(194,0,106,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Users size={24} color="#C2006A" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
              <ChevronUp size={16} /> 12%
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Visits</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{summary.totalVisits.toLocaleString()}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="analytics-card" 
          style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(0,166,153,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <MousePointer2 size={24} color="#00A699" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
              <ChevronUp size={16} /> 8.2%
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Signups</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{summary.totalSignups.toLocaleString()}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="analytics-card" 
          style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,180,0,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <TrendingUp size={24} color="#FFB400" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
              <ChevronDown size={16} /> 2.1%
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Conversion Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{summary.conversionRate}</div>
        </motion.div>
      </div>

      {/* Traffic Chart */}
      <div style={{ 
        background: '#fff', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
        border: '1px solid #f0f0f0',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Traffic Over Time</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Visitors in the last 7 days</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
             <span className="badge" style={{ background: '#f5f5f5', color: '#666', border: '1px solid #eee' }}>Last 7 Days</span>
          </div>
        </div>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <AreaChart data={visitsTimeline}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C2006A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#C2006A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#C2006A', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="count" stroke="#C2006A" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Referrers */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top Referral Sources</h3>
          <div className="referrer-list">
            {referrers.length > 0 ? referrers.map((ref, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.75rem 0',
                borderBottom: idx === referrers.length - 1 ? 'none' : '1px solid #f5f5f5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: 32, height: 32, 
                    borderRadius: '8px', 
                    background: '#f9f9f9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: '#666'
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{ref._id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ref.count}</span>
                  <div style={{ width: 60, height: 6, background: '#f0f0f0', borderRadius: 3 }}>
                    <div style={{ 
                      width: `${(ref.count / summary.totalVisits) * 100}%`, 
                      height: '100%', 
                      background: COLORS[idx % COLORS.length], 
                      borderRadius: 3 
                    }}></div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No referral data yet</div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Device Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
             {devices.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={devices}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="count"
                     nameKey="_id"
                   >
                     {devices.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div style={{ textAlign: 'center', color: '#999' }}>No device data yet</div>
             )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {devices.map((dev, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></div>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{dev._id}: {dev.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalytics;
