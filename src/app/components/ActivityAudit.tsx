/**
 * Activity & Audit Trail Component
 * 
 * Phase 4: Collaborative Time Logging & Activity Tracking
 * 
 * Features:
 * - Complete history of all time entries (own and collaborative)
 * - Shows who logged time on which work orders
 * - Proper attribution and audit trail
 * - Filter by date range, user, work order
 * - Visual distinction between own and collaborative entries
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar,
  User,
  Briefcase,
  Filter,
  Users,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { mockWorkOrders } from '../lib/mockData';
import { BottomNav } from './BottomNav';

type FilterType = 'all' | 'my-time' | 'team-time' | 'collaborative';

export const ActivityAudit = () => {
  const { 
    setCurrentScreen, 
    currentUser,
    recentEntries,
    theme,
  } = useApp();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Check if dark mode is active
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Filter entries based on selected filter
  const filteredEntries = recentEntries.filter(entry => {
    // Date filter
    const entryDate = new Date(entry.date);
    const today = new Date('2025-11-12');
    
    if (dateFilter === 'today') {
      const isSameDay = entryDate.toDateString() === today.toDateString();
      if (!isSameDay) return false;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (entryDate < weekAgo) return false;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      if (entryDate < monthAgo) return false;
    }

    // Entry type filter
    if (filterType === 'my-time') {
      // My own entries only (logged by me)
      return entry.loggedBy === currentUser.id;
    } else if (filterType === 'team-time') {
      // Entries by others on my work orders
      const workOrder = mockWorkOrders.find(wo => wo.number === entry.workOrderId);
      return workOrder?.owner === currentUser.id && entry.loggedBy !== currentUser.id;
    } else if (filterType === 'collaborative') {
      // My entries on others' work orders
      return entry.isCollaborative && entry.loggedBy === currentUser.id;
    }

    return true;
  });

  // Calculate stats
  const myTimeEntries = recentEntries.filter(e => e.loggedBy === currentUser.id && !e.isCollaborative);
  const collaborativeEntries = recentEntries.filter(e => e.isCollaborative && e.loggedBy === currentUser.id);
  const teamEntries = recentEntries.filter(e => {
    const workOrder = mockWorkOrders.find(wo => wo.number === e.workOrderId);
    return workOrder?.owner === currentUser.id && e.loggedBy !== currentUser.id;
  });

  const totalMyTime = myTimeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalCollabTime = collaborativeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalTeamTime = teamEntries.reduce((sum, e) => sum + e.durationMinutes, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date('2025-11-12');
    const yesterday = new Date('2025-11-11');
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

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
                Activity & Audit Trail
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                Complete time logging history
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <Activity className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className={`p-3 rounded-xl ${
              isDark ? 'bg-primary/10' : 'bg-primary/5'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-primary" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  My Time
                </p>
              </div>
              <p className="text-sm text-primary" style={{ fontWeight: 700 }}>
                {formatDuration(totalMyTime)}
              </p>
            </div>

            <div className={`p-3 rounded-xl ${
              isDark ? 'bg-secondary/10' : 'bg-secondary/5'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3 h-3 text-secondary" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  Collab
                </p>
              </div>
              <p className="text-sm text-secondary" style={{ fontWeight: 700 }}>
                {formatDuration(totalCollabTime)}
              </p>
            </div>

            <div className={`p-3 rounded-xl ${
              isDark ? 'bg-accent/10' : 'bg-accent/5'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-accent" strokeWidth={2} />
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  Team
                </p>
              </div>
              <p className="text-sm text-accent" style={{ fontWeight: 700 }}>
                {formatDuration(totalTeamTime)}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto mb-2">
            {([
              { id: 'all', label: 'All Activity' },
              { id: 'my-time', label: 'My Time' },
              { id: 'collaborative', label: 'Collaborative' },
              { id: 'team-time', label: 'Team Time' },
            ] as const).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                  filterType === filter.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card hover:bg-card/80 border-2 border-border/40'
                }`}
                style={{ fontWeight: 600 }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex gap-2">
            {([
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
            ] as const).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDateFilter(filter.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                  dateFilter === filter.id
                    ? 'bg-muted text-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                }`}
                style={{ fontWeight: 500 }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
        <div className="px-4 pt-4">
          {filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isDark ? 'bg-muted/30' : 'bg-muted/50'
              }`}>
                <Filter className="w-7 h-7 text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="text-sm text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
                No entries found
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                Try adjusting your filters
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => {
                const isMyEntry = entry.loggedBy === currentUser.id;
                const isCollaborative = entry.isCollaborative;
                const workOrder = mockWorkOrders.find(wo => wo.number === entry.workOrderId);

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isCollaborative
                        ? isDark
                          ? 'bg-card border-secondary/30 shadow-lg shadow-secondary/5'
                          : 'bg-card border-secondary/20 shadow-md'
                        : 'bg-card border-border/40'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCollaborative
                            ? isDark ? 'bg-secondary/20' : 'bg-secondary/10'
                            : isDark ? 'bg-primary/20' : 'bg-primary/10'
                        }`}>
                          {isCollaborative ? (
                            <Users className="w-4 h-4 text-secondary" strokeWidth={2} />
                          ) : (
                            <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ fontWeight: 700 }}>
                            {entry.description || 'No description'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                            {formatDate(entry.date)} • {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg ${
                        isDark ? 'bg-primary/20' : 'bg-primary/10'
                      }`}>
                        <p className="text-xs text-primary" style={{ fontWeight: 700 }}>
                          {entry.duration}
                        </p>
                      </div>
                    </div>

                    {/* Work Order Info */}
                    {entry.workOrderId && workOrder && (
                      <div className={`p-3 rounded-xl mb-3 ${
                        isDark ? 'bg-muted/20' : 'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                          <p className="text-xs" style={{ fontWeight: 700 }}>
                            {workOrder.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                          {workOrder.number} • {workOrder.client}
                        </p>
                      </div>
                    )}

                    {/* Attribution */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                          Logged by: <span style={{ fontWeight: 600 }}>{entry.loggedByName || currentUser.name}</span>
                        </p>
                      </div>

                      {isCollaborative && entry.workOrderOwnerName && (
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${
                          isDark ? 'bg-secondary/20' : 'bg-secondary/10'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-secondary" strokeWidth={2} />
                          <p className="text-xs text-secondary" style={{ fontWeight: 600 }}>
                            {entry.workOrderOwnerName}'s WO
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Billable Info */}
                    {entry.billable && workOrder?.rate && (
                      <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-lg ${
                          isDark ? 'bg-accent/20' : 'bg-accent/10'
                        }`}>
                          <p className="text-xs text-accent" style={{ fontWeight: 600 }}>
                            Billable • ₹{workOrder.rate}/hr
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

    </div>
  );
};