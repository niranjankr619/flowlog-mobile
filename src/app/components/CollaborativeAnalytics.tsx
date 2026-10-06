/**
 * Collaborative Analytics Component
 * 
 * Phase 5: Advanced Analytics for Team Collaboration
 * 
 * Features:
 * - Contribution breakdown per work order
 * - Cross-team collaboration metrics
 * - Time distribution charts (own vs collaborative)
 * - Efficiency insights
 * - Trend analysis
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingUp,
  Users,
  Clock,
  Briefcase,
  PieChart,
  BarChart3,
  Activity,
  Zap,
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { mockWorkOrders } from '../lib/mockData';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

export const CollaborativeAnalytics = () => {
  const { 
    setCurrentScreen, 
    currentUser,
    recentEntries,
    theme,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Calculate time distribution
  const myOwnTime = recentEntries
    .filter(e => e.loggedBy === currentUser.id && !e.isCollaborative)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const myCollaborativeTime = recentEntries
    .filter(e => e.loggedBy === currentUser.id && e.isCollaborative)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const othersOnMyWorkOrders = recentEntries
    .filter(e => {
      const workOrder = mockWorkOrders.find(wo => wo.number === e.workOrderId);
      return workOrder?.owner === currentUser.id && e.loggedBy !== currentUser.id;
    })
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const totalTime = myOwnTime + myCollaborativeTime + othersOnMyWorkOrders;

  // Pie chart data - Time Distribution
  const timeDistributionData = [
    { name: 'My Work Orders', value: myOwnTime, color: '#4B5CFB' },
    { name: 'Collaborative Work', value: myCollaborativeTime, color: '#00C7B7' },
    { name: 'Team on My WOs', value: othersOnMyWorkOrders, color: '#F0BB00' },
  ].filter(item => item.value > 0);

  // Work Order Collaboration Stats
  const workOrderStats = mockWorkOrders
    .map(wo => {
      const entries = recentEntries.filter(e => e.workOrderId === wo.number);
      const myEntries = entries.filter(e => e.loggedBy === currentUser.id);
      const othersEntries = entries.filter(e => e.loggedBy !== currentUser.id);
      
      const myTime = myEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
      const othersTime = othersEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
      const uniqueContributors = new Set(entries.map(e => e.loggedBy)).size;

      return {
        name: wo.number,
        fullName: wo.name,
        myTime: Math.round(myTime / 60 * 10) / 10,
        othersTime: Math.round(othersTime / 60 * 10) / 10,
        contributors: uniqueContributors,
        isOwner: wo.owner === currentUser.id,
      };
    })
    .filter(wo => wo.myTime > 0 || wo.othersTime > 0)
    .sort((a, b) => (b.myTime + b.othersTime) - (a.myTime + a.othersTime))
    .slice(0, 5);

  // Collaboration metrics
  const totalWorkOrders = new Set(recentEntries.map(e => e.workOrderId)).size;
  const collaborativeWorkOrders = new Set(
    recentEntries.filter(e => e.isCollaborative && e.loggedBy === currentUser.id).map(e => e.workOrderId)
  ).size;
  
  const collaborationRate = totalWorkOrders > 0 
    ? Math.round((collaborativeWorkOrders / totalWorkOrders) * 100) 
    : 0;

  const avgTimePerEntry = recentEntries.length > 0
    ? Math.round(totalTime / recentEntries.length)
    : 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/30">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentScreen('timer')}
              className="p-2 hover:bg-muted rounded-lg transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="flex-1">
              <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Collaborative Analytics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                Insights into team collaboration
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <BarChart3 className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                style={{ fontWeight: 600 }}
              >
                {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
        <div className="px-4 pt-4 space-y-4">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl ${
                isDark ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-gradient-to-br from-primary/5 to-primary/0'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  Total Time
                </p>
              </div>
              <p className="text-2xl text-primary" style={{ fontWeight: 700 }}>
                {formatDuration(totalTime)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`p-4 rounded-2xl ${
                isDark ? 'bg-gradient-to-br from-secondary/10 to-secondary/5' : 'bg-gradient-to-br from-secondary/5 to-secondary/0'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-secondary" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  Collab Rate
                </p>
              </div>
              <p className="text-2xl text-secondary" style={{ fontWeight: 700 }}>
                {collaborationRate}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-2xl ${
                isDark ? 'bg-gradient-to-br from-accent/10 to-accent/5' : 'bg-gradient-to-br from-accent/5 to-accent/0'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-accent" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  Work Orders
                </p>
              </div>
              <p className="text-2xl text-accent" style={{ fontWeight: 700 }}>
                {totalWorkOrders}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`p-4 rounded-2xl ${
                isDark ? 'bg-gradient-to-br from-muted/30 to-muted/10' : 'bg-gradient-to-br from-muted/20 to-muted/0'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-foreground" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  Avg/Entry
                </p>
              </div>
              <p className="text-2xl" style={{ fontWeight: 700 }}>
                {formatDuration(avgTimePerEntry)}
              </p>
            </motion.div>
          </div>

          {/* Time Distribution Chart */}
          {timeDistributionData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl bg-card border-2 border-border/40"
            >
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-primary" strokeWidth={2} />
                <h3 style={{ fontWeight: 700 }}>Time Distribution</h3>
              </div>

              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={timeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {timeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-2 rounded-lg shadow-lg ${
                              isDark ? 'bg-card border border-border' : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-xs" style={{ fontWeight: 600 }}>
                                {payload[0].name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDuration(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-2 mt-4">
                {timeDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <p className="text-xs" style={{ fontWeight: 500 }}>
                        {item.name}
                      </p>
                    </div>
                    <p className="text-xs" style={{ fontWeight: 700 }}>
                      {formatDuration(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Work Order Contributions Chart */}
          {workOrderStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-card border-2 border-border/40"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-secondary" strokeWidth={2} />
                <h3 style={{ fontWeight: 700 }}>Work Order Contributions</h3>
              </div>

              <div className="h-[240px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workOrderStats}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-3 rounded-lg shadow-lg ${
                              isDark ? 'bg-card border border-border' : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-xs mb-1" style={{ fontWeight: 700 }}>
                                {data.fullName}
                              </p>
                              <p className="text-xs text-primary">
                                My Time: {data.myTime}h
                              </p>
                              <p className="text-xs text-secondary">
                                Team Time: {data.othersTime}h
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {data.contributors} contributor{data.contributors > 1 ? 's' : ''}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="myTime" stackId="a" fill="#4B5CFB" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="othersTime" stackId="a" fill="#00C7B7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4B5CFB' }} />
                  <span style={{ fontWeight: 500 }}>My Time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#00C7B7' }} />
                  <span style={{ fontWeight: 500 }}>Team Time</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-2xl border-2 ${
              isDark
                ? 'bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20'
                : 'bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" strokeWidth={2} />
              <h3 style={{ fontWeight: 700 }}>AI Insights</h3>
            </div>
            
            <div className="space-y-2">
              {myCollaborativeTime > 0 && (
                <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.5 }}>
                  💡 You spent <span style={{ fontWeight: 700 }}>
                    {Math.round((myCollaborativeTime / totalTime) * 100)}%
                  </span> of your time on collaborative work orders.
                </p>
              )}
              
              {othersOnMyWorkOrders > 0 && (
                <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.5 }}>
                  🤝 Your team contributed <span style={{ fontWeight: 700 }}>
                    {formatDuration(othersOnMyWorkOrders)}
                  </span> to your work orders this period.
                </p>
              )}

              {collaborationRate > 50 && (
                <p className="text-sm" style={{ fontWeight: 500, lineHeight: 1.5 }}>
                  🌟 Great collaboration! You're actively working on{' '}
                  <span style={{ fontWeight: 700 }}>{collaborationRate}%</span> of work orders with your team.
                </p>
              )}

              {totalWorkOrders === 0 && (
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 500, lineHeight: 1.5 }}>
                  Start logging time to see collaboration insights here!
                </p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
      <BottomNav />
    </div>
  );
};