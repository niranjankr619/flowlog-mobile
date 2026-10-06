/**
 * Pending Approvals Dashboard
 * 
 * Shows time entries logged by others on your work orders
 * Allows you to approve/reject time with partial approval support
 * 
 * Features:
 * - View all pending time entries on your work orders
 * - Approve/reject time entries
 * - Partial approval support
 * - View approval history
 * - Quick stats on pending approvals
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { Badge } from './ui/badge';
import { BottomNav } from './BottomNav';

export const TeamDashboard = () => {
  const { 
    setCurrentScreen, 
    currentUser,
    recentEntries,
    theme,
    setSelectedEntry,
  } = useApp();

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isLightTheme = !isDark;

  // Filter entries where others logged time on MY work orders
  const pendingApprovals = recentEntries.filter(entry => 
    entry.isCollaborative && 
    entry.workOrderOwner === currentUser.id &&
    entry.loggedBy !== currentUser.id
  );

  // Separate by status
  const pending = pendingApprovals.filter(e => e.approvalStatus === 'pending' || !e.approvalStatus);
  const partiallyApproved = pendingApprovals.filter(e => e.approvalStatus === 'partially-approved');
  const approved = pendingApprovals.filter(e => e.approvalStatus === 'approved');
  const rejected = pendingApprovals.filter(e => e.approvalStatus === 'rejected');

  // Calculate stats
  const totalPendingMinutes = pending.reduce((sum, e) => sum + (e.pendingMinutes || e.durationMinutes), 0);
  const totalPartialMinutes = partiallyApproved.reduce((sum, e) => sum + (e.pendingMinutes || 0), 0);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleEntryClick = (entry: any) => {
    setSelectedEntry(entry);
    setCurrentScreen('entry-details');
  };

  // Theme colors
  const bgGradient = isLightTheme
    ? 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)'
    : 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)';

  const cardBg = isLightTheme ? 'bg-white' : 'bg-card';
  const borderOpacity = isLightTheme ? 'border-border/40' : 'border-border/20';

  return (
    <div 
      className="h-screen flex flex-col"
      style={{
        background: bgGradient,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/20">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 hover:bg-accent/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div className="flex-1">
            <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Pending Approvals
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
              Review time logged on your work orders
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {/* Pending */}
          <div 
            className={`p-3 rounded-xl ${cardBg} border ${borderOpacity}`}
            style={{
              background: isLightTheme 
                ? 'rgba(240, 187, 0, 0.08)' 
                : 'rgba(240, 187, 0, 0.12)',
            }}
          >
            <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
              Pending
            </p>
            <p className="text-lg" style={{ fontWeight: 700, color: '#F0BB00' }}>
              {pending.length}
            </p>
            <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
              {formatDuration(totalPendingMinutes)}
            </p>
          </div>

          {/* Partial */}
          <div 
            className={`p-3 rounded-xl ${cardBg} border ${borderOpacity}`}
            style={{
              background: isLightTheme 
                ? 'rgba(75, 92, 251, 0.08)' 
                : 'rgba(75, 92, 251, 0.12)',
            }}
          >
            <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
              Partial
            </p>
            <p className="text-lg" style={{ fontWeight: 700, color: '#4B5CFB' }}>
              {partiallyApproved.length}
            </p>
            <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
              {formatDuration(totalPartialMinutes)} left
            </p>
          </div>

          {/* Approved */}
          <div 
            className={`p-3 rounded-xl ${cardBg} border ${borderOpacity}`}
            style={{
              background: isLightTheme 
                ? 'rgba(0, 214, 143, 0.08)' 
                : 'rgba(0, 214, 143, 0.12)',
            }}
          >
            <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
              Approved
            </p>
            <p className="text-lg" style={{ fontWeight: 700, color: '#00D68F' }}>
              {approved.length}
            </p>
            <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
              This week
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {pendingApprovals.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: isLightTheme 
                  ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.1) 0%, rgba(0, 199, 183, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(75, 92, 251, 0.2) 0%, rgba(0, 199, 183, 0.2) 100%)',
              }}
            >
              <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
            <h3 className="mb-2" style={{ fontWeight: 700 }}>
              All Caught Up!
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
              No pending approvals at the moment.
              When team members log time on your work orders, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Section */}
            {pending.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-accent" strokeWidth={2} />
                  <h3 className="text-sm" style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                    NEEDS REVIEW ({pending.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {pending.map((entry) => (
                    <motion.div
                      key={entry.id}
                      onClick={() => handleEntryClick(entry)}
                      className={`p-4 rounded-2xl ${cardBg} border ${borderOpacity} cursor-pointer`}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: isLightTheme
                          ? 'rgba(240, 187, 0, 0.05)'
                          : 'rgba(240, 187, 0, 0.08)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                              {entry.loggedByName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                              {entry.activityName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className="text-xs px-2 py-0.5 shrink-0"
                          style={isLightTheme ? {
                            backgroundColor: 'rgba(240, 187, 0, 0.15)',
                            color: '#C89500',
                            fontWeight: 600,
                            border: '1px solid rgba(240, 187, 0, 0.3)',
                          } : {
                            backgroundColor: 'rgba(240, 187, 0, 0.25)',
                            color: '#F0BB00',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          Pending
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                              Time
                            </p>
                            <p className="text-sm" style={{ fontWeight: 700 }}>
                              {formatDuration(entry.durationMinutes)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                              Date
                            </p>
                            <p className="text-sm" style={{ fontWeight: 600 }}>
                              {formatDate(entry.date)}
                            </p>
                          </div>
                          {entry.billable && entry.rate > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                                Amount
                              </p>
                              <p className="text-sm" style={{ fontWeight: 700, color: '#00C7B7' }}>
                                ₹{((entry.rate * entry.durationMinutes) / 60).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {entry.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-1" style={{ fontWeight: 500 }}>
                          {entry.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Partially Approved Section */}
            {partiallyApproved.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
                  <h3 className="text-sm" style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                    PARTIALLY APPROVED ({partiallyApproved.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {partiallyApproved.map((entry) => (
                    <motion.div
                      key={entry.id}
                      onClick={() => handleEntryClick(entry)}
                      className={`p-4 rounded-2xl ${cardBg} border ${borderOpacity} cursor-pointer`}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: isLightTheme
                          ? 'rgba(75, 92, 251, 0.05)'
                          : 'rgba(75, 92, 251, 0.08)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                              {entry.loggedByName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                              {entry.activityName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className="text-xs px-2 py-0.5 shrink-0"
                          style={isLightTheme ? {
                            backgroundColor: 'rgba(75, 92, 251, 0.15)',
                            color: '#3443D9',
                            fontWeight: 600,
                            border: '1px solid rgba(75, 92, 251, 0.3)',
                          } : {
                            backgroundColor: 'rgba(75, 92, 251, 0.25)',
                            color: '#4B5CFB',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          Partial
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground" style={{ fontWeight: 500 }}>
                            Approved: {formatDuration(entry.approvedMinutes)}
                          </span>
                          <span className="text-muted-foreground" style={{ fontWeight: 500 }}>
                            Pending: {formatDuration(entry.pendingMinutes)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success"
                            style={{ 
                              width: `${(entry.approvedMinutes / entry.durationMinutes) * 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                              Date
                            </p>
                            <p className="text-sm" style={{ fontWeight: 600 }}>
                              {formatDate(entry.date)}
                            </p>
                          </div>
                          {entry.billable && entry.rate > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                                Pending ₹
                              </p>
                              <p className="text-sm" style={{ fontWeight: 700, color: '#F0BB00' }}>
                                ₹{((entry.rate * entry.pendingMinutes) / 60).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Approved Section */}
            {approved.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2} />
                  <h3 className="text-sm" style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                    RECENTLY APPROVED ({approved.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {approved.slice(0, 3).map((entry) => (
                    <motion.div
                      key={entry.id}
                      onClick={() => handleEntryClick(entry)}
                      className={`p-4 rounded-2xl ${cardBg} border ${borderOpacity} cursor-pointer`}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: isLightTheme
                          ? 'rgba(0, 214, 143, 0.05)'
                          : 'rgba(0, 214, 143, 0.08)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                              {entry.loggedByName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                              {entry.activityName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className="text-xs px-2 py-0.5 shrink-0"
                          style={isLightTheme ? {
                            backgroundColor: 'rgba(0, 214, 143, 0.15)',
                            color: '#006B54',
                            fontWeight: 600,
                            border: '1px solid rgba(0, 214, 143, 0.3)',
                          } : {
                            backgroundColor: 'rgba(0, 214, 143, 0.25)',
                            color: '#00D68F',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          ✓ Approved
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                              Time
                            </p>
                            <p className="text-sm" style={{ fontWeight: 700 }}>
                              {formatDuration(entry.approvedMinutes)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5" style={{ fontWeight: 500 }}>
                              Date
                            </p>
                            <p className="text-sm" style={{ fontWeight: 600 }}>
                              {formatDate(entry.date)}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};