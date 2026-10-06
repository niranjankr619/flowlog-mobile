import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Activity,
  FileCheck,
  ChevronRight,
  Briefcase,
  User,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { mockWorkOrders } from '../lib/mockData';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { BottomNav } from './BottomNav';

export const SubWorkOrderSurveillance = () => {
  const { setCurrentScreen, currentUser, subWorkOrders, theme, recentEntries } = useApp();
  const [selectedSubWO, setSelectedSubWO] = useState<string | null>(null);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isLightTheme = !isDark;

  // Filter Sub Work Orders where current user is the owner AND status is active
  const myActiveSubWorkOrders = subWorkOrders.filter(
    swo => swo.assignedById === currentUser.id && swo.status === 'active'
  );

  // Get work order details
  const getWorkOrderDetails = (workOrderId: string) => {
    return mockWorkOrders.find(wo => wo.number === workOrderId);
  };

  // Get time logs for a specific sub work order
  const getTimeLogsForSubWO = (subWOId: string) => {
    return recentEntries.filter(entry => (entry as any).subWorkOrderId === subWOId);
  };

  // Detailed view
  if (selectedSubWO) {
    const subWO = myActiveSubWorkOrders.find(s => s.id === selectedSubWO);
    if (!subWO) return null;

    const workOrder = getWorkOrderDetails(subWO.parentWorkOrderId);
    const progressPercent = Math.round((subWO.usedMinutes / subWO.allocatedMinutes) * 100);
    const submittedDeliverables = (subWO as any).submittedDeliverables || [];
    const timeLogs = getTimeLogsForSubWO(subWO.id);

    // Calculate time usage status
    const isOverBudget = progressPercent > 100;
    const isNearLimit = progressPercent > 80 && progressPercent <= 100;

    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-overlay border-b border-border/30">
          <div className="p-4 safe-top">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedSubWO(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </button>
              <div className="flex-1">
                <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Surveillance
                </h2>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  {subWO.assignedToName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Sub Work Order Info */}
          <div 
            className="p-4 rounded-xl border border-border/40"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.08) 0%, rgba(0, 199, 183, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(75, 92, 251, 0.04) 0%, rgba(0, 199, 183, 0.02) 100%)',
              ...(isLightTheme && {
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              })
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" strokeWidth={2} />
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                SUB WORK ORDER
              </p>
            </div>
            <h3 className="mb-1" style={{ fontWeight: 700 }}>
              {subWO.subWorkOrderName}
            </h3>
            <p className="text-sm text-muted-foreground mb-2" style={{ fontWeight: 500 }}>
              {subWO.parentWorkOrderName}
            </p>
            
            {/* Assignee */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{subWO.assignedToName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm" style={{ fontWeight: 600 }}>
                  {subWO.assignedToName}
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  {subWO.assignedToRole}
                </p>
              </div>
            </div>
          </div>

          {/* Time Progress with Status Alert */}
          <div 
            className="p-4 rounded-xl border border-border/40"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              ...(isLightTheme && {
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              })
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" strokeWidth={2} />
                <h4 style={{ fontWeight: 700 }}>Time Usage</h4>
              </div>
              {isOverBudget && (
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                    color: isDark ? '#F87171' : '#DC2626',
                    fontWeight: 600,
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  Over Budget
                </Badge>
              )}
              {isNearLimit && !isOverBudget && (
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(240, 187, 0, 0.2)' : 'rgba(240, 187, 0, 0.15)',
                    color: isDark ? '#F0BB00' : '#C89500',
                    fontWeight: 600,
                    border: `1px solid ${isDark ? 'rgba(240, 187, 0, 0.4)' : 'rgba(240, 187, 0, 0.3)'}`,
                  }}
                >
                  Near Limit
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xl mb-1" style={{ fontWeight: 700 }}>
                  {Math.round(subWO.allocatedMinutes / 60 * 10) / 10}h
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  Allocated
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p 
                  className="text-xl mb-1" 
                  style={{ 
                    fontWeight: 700, 
                    color: isOverBudget ? '#EF4444' : '#4B5CFB' 
                  }}
                >
                  {Math.round(subWO.usedMinutes / 60 * 10) / 10}h
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  Used
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p 
                  className="text-xl mb-1" 
                  style={{ 
                    fontWeight: 700, 
                    color: subWO.remainingMinutes < 0 ? '#EF4444' : '#00C7B7' 
                  }}
                >
                  {Math.abs(Math.round(subWO.remainingMinutes / 60 * 10) / 10)}h
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  {subWO.remainingMinutes < 0 ? 'Over' : 'Remaining'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: isOverBudget 
                    ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                    : 'linear-gradient(90deg, #4B5CFB 0%, #00C7B7 100%)',
                  width: `${Math.min(progressPercent, 100)}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2" style={{ fontWeight: 600 }}>
              {progressPercent}% USED
            </p>
          </div>

          {/* Real-time Time Logs */}
          <div 
            className="p-4 rounded-xl border border-border/40"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              ...(isLightTheme && {
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              })
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" strokeWidth={2} />
                <h4 style={{ fontWeight: 700 }}>Time Logs</h4>
              </div>
              <Badge
                className="text-xs"
                style={isDark ? {
                  backgroundColor: 'rgba(75, 92, 251, 0.2)',
                  color: '#4B5CFB',
                  fontWeight: 600,
                  border: '1px solid rgba(75, 92, 251, 0.4)',
                } : {
                  backgroundColor: 'rgba(75, 92, 251, 0.15)',
                  color: '#3443D9',
                  fontWeight: 600,
                  border: '1px solid rgba(75, 92, 251, 0.35)',
                }}
              >
                {timeLogs.length} Entries
              </Badge>
            </div>

            {timeLogs.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={2} />
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                  No time logs yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {timeLogs.map((log, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-muted/30 border border-border/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm mb-1" style={{ fontWeight: 600 }}>
                          {log.description || 'Work session'}
                        </p>
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                          {new Date(log.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge
                        className="text-xs"
                        style={isDark ? {
                          backgroundColor: 'rgba(0, 199, 183, 0.2)',
                          color: '#00C7B7',
                          fontWeight: 600,
                          border: '1px solid rgba(0, 199, 183, 0.4)',
                        } : {
                          backgroundColor: 'rgba(0, 199, 183, 0.15)',
                          color: '#008C7A',
                          fontWeight: 600,
                          border: '1px solid rgba(0, 199, 183, 0.35)',
                        }}
                      >
                        {log.duration}
                      </Badge>
                    </div>
                    {log.activityType && (
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                        Activity: {log.activityType}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deliverables Submitted */}
          <div 
            className="p-4 rounded-xl border border-border/40"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              ...(isLightTheme && {
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              })
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" strokeWidth={2} />
                <h4 style={{ fontWeight: 700 }}>Deliverables</h4>
              </div>
              <Badge
                className="text-xs"
                style={isDark ? {
                  backgroundColor: submittedDeliverables.length > 0 ? 'rgba(0, 199, 183, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: submittedDeliverables.length > 0 ? '#00C7B7' : '#888',
                  fontWeight: 600,
                  border: `1px solid ${submittedDeliverables.length > 0 ? 'rgba(0, 199, 183, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                } : {
                  backgroundColor: submittedDeliverables.length > 0 ? 'rgba(0, 199, 183, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                  color: submittedDeliverables.length > 0 ? '#008C7A' : '#666',
                  fontWeight: 600,
                  border: `1px solid ${submittedDeliverables.length > 0 ? 'rgba(0, 199, 183, 0.35)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                {submittedDeliverables.length} Submitted
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3 leading-relaxed" style={{ fontWeight: 500 }}>
              {subWO.deliverables}
            </p>

            {submittedDeliverables.length > 0 ? (
              <div className="space-y-2">
                {submittedDeliverables.map((del: any, idx: number) => (
                  <div key={del.id} className="p-3 rounded-lg bg-muted/30 border border-border/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs mb-1" style={{ fontWeight: 600 }}>
                          Submission #{idx + 1}
                        </p>
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                          {new Date(del.submittedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    {del.notes && (
                      <p className="text-xs text-muted-foreground mb-2" style={{ fontWeight: 500 }}>
                        {del.notes}
                      </p>
                    )}
                    <div className="space-y-1">
                      {del.attachments.map((att: any, attIdx: number) => (
                        <div key={attIdx} className="flex items-center gap-2 text-xs bg-background/50 p-1.5 rounded">
                          <FileCheck className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                          <span className="flex-1 truncate" style={{ fontWeight: 500 }}>{att.name}</span>
                          <span className="text-muted-foreground" style={{ fontWeight: 500 }}>{att.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FileCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={2} />
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                  No deliverables submitted yet
                </p>
              </div>
            )}
          </div>
        </div>

        <BottomNav currentScreen="home" />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-overlay border-b border-border/30">
        <div className="p-4 safe-top">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Sub WO Surveillance
            </h2>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div 
              className="p-3 rounded-xl text-center border border-border/40"
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
                ...(isLightTheme && {
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                })
              }}
            >
              <p className="text-2xl mb-1" style={{ fontWeight: 700 }}>
                {myActiveSubWorkOrders.length}
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                Active
              </p>
            </div>
            <div 
              className="p-3 rounded-xl text-center border border-border/40"
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
                ...(isLightTheme && {
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                })
              }}
            >
              <p className="text-2xl mb-1" style={{ fontWeight: 700, color: '#4B5CFB' }}>
                {myActiveSubWorkOrders.reduce((sum, swo) => sum + Math.round(swo.usedMinutes / 60), 0)}h
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                Total Used
              </p>
            </div>
            <div 
              className="p-3 rounded-xl text-center border border-border/40"
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
                ...(isLightTheme && {
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                })
              }}
            >
              <p className="text-2xl mb-1" style={{ fontWeight: 700, color: '#00C7B7' }}>
                {myActiveSubWorkOrders.filter(swo => (swo as any).submittedDeliverables?.length > 0).length}
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                With Progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sub Work Orders List */}
      <div className="p-4 space-y-3">
        {myActiveSubWorkOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-xl text-center border border-border/40"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              ...(isLightTheme && {
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              })
            }}
          >
            <Eye className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={2} />
            <h3 className="mb-2" style={{ fontWeight: 700 }}>
              No Active Sub Work Orders
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
              No active sub work orders to monitor at the moment.
            </p>
          </motion.div>
        ) : (
          myActiveSubWorkOrders.map((subWO, index) => {
            const progressPercent = Math.round((subWO.usedMinutes / subWO.allocatedMinutes) * 100);
            const submittedDeliverables = (subWO as any).submittedDeliverables || [];
            const timeLogs = getTimeLogsForSubWO(subWO.id);
            const isOverBudget = progressPercent > 100;
            const isNearLimit = progressPercent > 80 && progressPercent <= 100;

            return (
              <motion.button
                key={subWO.id}
                onClick={() => setSelectedSubWO(subWO.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full p-4 rounded-xl text-left border border-border/40 hover:border-primary/50 transition-all"
                style={{
                  background: isDark
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  ...(isLightTheme && {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  })
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs">{subWO.assignedToName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-0.5 truncate" style={{ fontWeight: 700 }}>
                      {subWO.subWorkOrderName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                      {subWO.assignedToName} • {subWO.parentWorkOrderName}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={2} />
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-2 mb-3">
                  {isOverBudget && (
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                        color: isDark ? '#F87171' : '#DC2626',
                        fontWeight: 600,
                        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" strokeWidth={2} />
                      Over Budget
                    </Badge>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(240, 187, 0, 0.2)' : 'rgba(240, 187, 0, 0.15)',
                        color: isDark ? '#F0BB00' : '#C89500',
                        fontWeight: 600,
                        border: `1px solid ${isDark ? 'rgba(240, 187, 0, 0.4)' : 'rgba(240, 187, 0, 0.3)'}`,
                      }}
                    >
                      Near Limit
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                      TIME PROGRESS
                    </span>
                    <span 
                      className="text-xs" 
                      style={{ 
                        fontWeight: 700, 
                        color: isOverBudget ? '#EF4444' : '#4B5CFB' 
                      }}
                    >
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: isOverBudget 
                          ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                          : 'linear-gradient(90deg, #4B5CFB 0%, #00C7B7 100%)',
                        width: `${Math.min(progressPercent, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <span style={{ fontWeight: 600 }}>
                        {Math.round(subWO.usedMinutes / 60 * 10) / 10}h / {Math.round(subWO.allocatedMinutes / 60 * 10) / 10}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <span style={{ fontWeight: 600 }}>
                        {timeLogs.length} log{timeLogs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <span style={{ fontWeight: 600 }}>
                        {submittedDeliverables.length}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      <BottomNav currentScreen="home" />
    </div>
  );
};
