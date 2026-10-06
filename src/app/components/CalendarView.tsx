/**
 * Calendar View Component
 * 
 * Shows:
 * - Scheduled meetings from integrations (Google/Microsoft)
 * - Actual time logs
 * - Day/Week/Month filters
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Video,
  Code,
  Zap,
  Users,
  ExternalLink,
  Copy,
  X
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { Switch } from './ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { BottomNav } from './BottomNav';
import { MeetingDetailSheet } from './MeetingDetailSheet';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month';
type TabMode = 'all' | 'timelogs' | 'meetings';

interface ScheduledMeeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  source: 'google' | 'microsoft';
  attendees?: number;
  attendeeList?: string[]; // Full attendee names
  meetingLink?: string; // Meeting URL
  type: 'meeting' | 'call' | 'sync';
  status: 'scheduled' | 'auto-logged' | 'skipped';
  platform?: 'google-meet' | 'microsoft-teams' | 'zoom'; // Meeting platform
  description?: string; // Meeting description
}

interface TimeLog {
  id: string;
  workOrder: string;
  workOrderType: 'general' | 'direct' | 'sequence';
  description: string;
  start: Date;
  end: Date | null;
  duration: number;
  type: 'manual' | 'auto' | 'meeting';
  status: 'running' | 'completed' | 'approved';
}

// Mock data - Comprehensive schedule
const mockScheduledMeetings: ScheduledMeeting[] = [
  {
    id: 'meet-1',
    title: 'Sprint Planning & Retrospective',
    start: new Date(2025, 10, 17, 9, 0),
    end: new Date(2025, 10, 17, 11, 30),
    source: 'google',
    attendees: 8,
    attendeeList: ['Niranjan Raghavan', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'John Smith', 'Rachel Green', 'Tom Wilson', 'Lisa Anderson'],
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    platform: 'google-meet',
    description: 'Q4 Sprint planning session and retrospective for the previous sprint',
    type: 'meeting',
    status: 'auto-logged'
  },
  {
    id: 'meet-2',
    title: 'Client Demo - Acme Corp Q4 Review',
    start: new Date(2025, 10, 17, 14, 0),
    end: new Date(2025, 10, 17, 16, 0),
    source: 'microsoft',
    attendees: 12,
    attendeeList: ['Niranjan Raghavan', 'John Smith (Acme)', 'Sarah Johnson', 'David Martinez (Acme)', 'Emma Wilson', 'Robert Brown (Acme)', 'Linda Davis', 'Michael Taylor (Acme)', 'Jennifer White', 'Chris Lee (Acme)', 'Amanda Clark', 'Steven Harris (Acme)'],
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/xyz123',
    platform: 'microsoft-teams',
    description: 'Quarterly business review and product demo for Acme Corporation',
    type: 'call',
    status: 'scheduled'
  },
  {
    id: 'meet-3',
    title: 'Architecture Discussion',
    start: new Date(2025, 10, 17, 17, 0),
    end: new Date(2025, 10, 17, 18, 30),
    source: 'google',
    attendees: 5,
    attendeeList: ['Niranjan Raghavan', 'Mike Chen', 'Emily Davis', 'Tom Wilson', 'Rachel Green'],
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    platform: 'google-meet',
    description: 'System architecture review and database optimization strategy',
    type: 'meeting',
    status: 'scheduled'
  }
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 'log-1',
    workOrder: 'WO-2024-001',
    workOrderType: 'general',
    description: 'Sprint Planning & Retrospective',
    start: new Date(2025, 10, 17, 9, 0),
    end: new Date(2025, 10, 17, 11, 30),
    duration: 150,
    type: 'meeting',
    status: 'approved'
  },
  {
    id: 'log-2',
    workOrder: 'WO-2024-003',
    workOrderType: 'direct',
    description: 'Database optimization and query performance',
    start: new Date(2025, 10, 17, 11, 45),
    end: new Date(2025, 10, 17, 14, 0),
    duration: 135,
    type: 'manual',
    status: 'completed'
  },
  {
    id: 'log-3',
    workOrder: 'WO-2024-005',
    workOrderType: 'sequence',
    description: 'Code review and refactoring authentication module',
    start: new Date(2025, 10, 17, 16, 15),
    end: new Date(2025, 10, 17, 17, 0),
    duration: 45,
    type: 'manual',
    status: 'completed'
  }
];

export const CalendarView = () => {
  const { setCurrentScreen, theme } = useApp();
  const [tabMode, setTabMode] = useState<TabMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 17));
  const [autoStopOnMeeting, setAutoStopOnMeeting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [meetingSourceFilter, setMeetingSourceFilter] = useState<string[]>([]);
  const [meetingStatusFilter, setMeetingStatusFilter] = useState<string[]>([]);
  const [workOrderTypeFilter, setWorkOrderTypeFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  
  // Check if light theme
  const isLightTheme = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Toggle filter helper
  const toggleFilter = (currentFilters: string[], setFilters: (filters: string[]) => void, value: string) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter(f => f !== value));
    } else {
      setFilters([...currentFilters, value]);
    }
  };

  // Calculate active filter count
  const activeFilterCount = 
    meetingSourceFilter.length +
    meetingStatusFilter.length +
    workOrderTypeFilter.length +
    (dateFilter !== 'all' ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setMeetingSourceFilter([]);
    setMeetingStatusFilter([]);
    setWorkOrderTypeFilter([]);
    setDateFilter('all');
    toast.success('All filters cleared');
  };

  // Apply filters to data
  const filteredMeetings = mockScheduledMeetings.filter(meeting => {
    // Meeting source filter
    const sourceMatch = meetingSourceFilter.length === 0 || meetingSourceFilter.includes(meeting.source);
    
    // Meeting status filter
    const statusMatch = meetingStatusFilter.length === 0 || meetingStatusFilter.includes(meeting.status);
    
    return sourceMatch && statusMatch;
  });

  const filteredTimeLogs = mockTimeLogs.filter(log => {
    // Work order type filter
    const typeMatch = workOrderTypeFilter.length === 0 || workOrderTypeFilter.includes(log.workOrderType);
    
    // Date filter
    const dateMatch = checkDateFilter(log.start, dateFilter);
    
    return typeMatch && dateMatch;
  });

  // Helper function to check date filter
  function checkDateFilter(date: Date, filter: typeof dateFilter): boolean {
    if (filter === 'all') return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (filter) {
      case 'today':
        return date >= today;
      case 'yesterday':
        return date >= yesterday && date < today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      default:
        return true;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/30">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="p-2 hover:bg-muted rounded-lg transition-all"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              <div>
                <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Calendar
                </h2>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>

          {/* Horizontal Scrollable Day Selector */}
          <HorizontalDaySelector 
            currentDate={currentDate}
            onDateSelect={(date) => setCurrentDate(date)}
          />

          {/* Auto-Stop Setting - Left side */}
          <div className="flex gap-2 mb-3">
            {/* Left: Auto-stop toggle (78%) */}
            <div 
              className="flex-[0_0_78%] p-2.5 rounded-lg bg-card/30 border border-border/30 h-[60px]"
              style={{
                ...(isLightTheme && {
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                })
              }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2} />
                <span className="text-xs flex-1" style={{ fontWeight: 600 }}>
                  Auto-stop timer on meeting
                </span>
                <Switch
                  checked={autoStopOnMeeting}
                  onCheckedChange={(checked) => {
                    setAutoStopOnMeeting(checked);
                    toast.success(checked ? 'Timer will auto-stop for meetings' : 'You\'ll be asked every time');
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-5.5 line-clamp-1" style={{ fontWeight: 500, fontSize: '10px' }}>
                {autoStopOnMeeting ? 'Auto-stops when meetings start' : 'Manual conflict resolution'}
              </p>
            </div>

            {/* Right: Filter button (22%) */}
            <div 
              className="flex-[0_0_22%] p-2.5 rounded-lg bg-card/30 border border-border/30 relative"
              style={{
                ...(isLightTheme && {
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                })
              }}
            >
              <button
                className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg hover:bg-muted/50 transition-all w-full h-full justify-center"
                onClick={() => setShowFilters(true)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span className="text-xs text-center" style={{ fontWeight: 600, fontSize: '9px' }}>
                  Filter
                </span>
              </button>
              {activeFilterCount > 0 && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  style={{ 
                    background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '9px'
                  }}
                >
                  {activeFilterCount}
                </div>
              )}
            </div>
          </div>

          {/* View Filter Buttons - Dedicated like All Entries */}
        </div>
      </div>

      {/* Content - Day View */}
      {viewMode === 'day' && (
        <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
          <DayView 
            date={currentDate}
            meetings={filteredMeetings}
            timeLogs={filteredTimeLogs}
            tabMode={tabMode}
          />
        </div>
      )}

      {/* Week/Month views would go here */}
      {viewMode === 'week' && (
        <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
          <div className="px-4 pt-8 max-w-md mx-auto text-center">
            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
              Week view coming soon
            </p>
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
          <div className="px-4 pt-8 max-w-md mx-auto text-center">
            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
              Month view coming soon
            </p>
          </div>
        </div>
      )}

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-[85vh] !bg-transparent border-t border-border/50 p-0">
          <div className="h-full glass-overlay rounded-t-[32px] border border-border/50 flex flex-col">
            <SheetHeader className="px-6 pt-8 pb-4">
              <SheetTitle style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Filters
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Refine your calendar view with filters
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32">
              {/* Show Filter (All/Time Logs/Meetings) */}
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>SHOW</p>
                <div className="flex gap-2">
                  {[
                    { label: 'All', value: 'all' as TabMode },
                    { label: 'Time Logs', value: 'timelogs' as TabMode },
                    { label: 'Meetings', value: 'meetings' as TabMode },
                  ].map((mode) => (
                    <Button
                      key={mode.value}
                      variant={tabMode === mode.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTabMode(mode.value)}
                      className="text-xs flex-1"
                      style={{ fontWeight: 600 }}
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>DATE RANGE</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All Time', value: 'all' as const },
                    { label: 'Today', value: 'today' as const },
                    { label: 'Yesterday', value: 'yesterday' as const },
                    { label: 'This Week', value: 'week' as const },
                    { label: 'This Month', value: 'month' as const },
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={dateFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateFilter(filter.value)}
                      className="text-xs"
                      style={{ fontWeight: 600 }}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Meeting Source Filter */}
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>MEETING SOURCE</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Google Calendar', value: 'google' },
                    { label: 'Microsoft 365', value: 'microsoft' },
                  ].map((source) => (
                    <Button
                      key={source.value}
                      variant={meetingSourceFilter.includes(source.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter(meetingSourceFilter, setMeetingSourceFilter, source.value)}
                      className="text-xs"
                      style={{ fontWeight: 600 }}
                    >
                      {source.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Meeting Status Filter */}
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>MEETING STATUS</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Scheduled', value: 'scheduled' },
                    { label: 'Auto-Logged', value: 'auto-logged' },
                    { label: 'Skipped', value: 'skipped' },
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={meetingStatusFilter.includes(status.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter(meetingStatusFilter, setMeetingStatusFilter, status.value)}
                      className="text-xs"
                      style={{ fontWeight: 600 }}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Work Order Type Filter (for time logs) */}
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>WORK ORDER TYPE</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Direct', value: 'direct' },
                    { label: 'Sequence', value: 'sequence' },
                    { label: 'General', value: 'general' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={workOrderTypeFilter.includes(type.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter(workOrderTypeFilter, setWorkOrderTypeFilter, type.value)}
                      className="text-xs"
                      style={{ fontWeight: 600 }}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-6 pt-4 glass-overlay border-t border-border/50 space-y-3 rounded-t-[24px]">
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full text-xs"
                  style={{ fontWeight: 600 }}
                >
                  Clear All Filters
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowFilters(false)}
                className="w-full text-xs"
                style={{ fontWeight: 600 }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="calendar" />
    </div>
  );
};

// Day View Component
const DayView = ({ 
  date,
  meetings,
  timeLogs,
  tabMode
}: { 
  date: Date;
  meetings: ScheduledMeeting[];
  timeLogs: TimeLog[];
  tabMode: TabMode;
}) => {
  const { theme } = useApp();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduledMeeting | null>(null);

  // Check if light theme
  const isLightTheme = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Helper function to get time log card styles based on work order type
  const getTimeLogStyles = (log: TimeLog) => {
    if (isLightTheme) {
      // Light theme - better contrast with darker colors and stronger borders
      if (log.workOrderType === 'sequence') {
        return {
          background: 'linear-gradient(120deg, rgba(0, 199, 183, 0.25) 0%, rgba(0, 199, 183, 0.12) 100%)',
          borderClass: 'border-secondary/50 shadow-sm',
          iconBg: 'rgba(0, 199, 183, 0.35)',
          iconColor: '#006B5F',
          textColor: '#111827'
        };
      } else if (log.workOrderType === 'direct') {
        return {
          background: 'linear-gradient(120deg, rgba(75, 92, 251, 0.25) 0%, rgba(75, 92, 251, 0.12) 100%)',
          borderClass: 'border-primary/50 shadow-sm',
          iconBg: 'rgba(75, 92, 251, 0.35)',
          iconColor: '#2A3BB7',
          textColor: '#111827'
        };
      } else {
        return {
          background: 'linear-gradient(120deg, rgba(240, 187, 0, 0.25) 0%, rgba(240, 187, 0, 0.12) 100%)',
          borderClass: 'border-accent/50 shadow-sm',
          iconBg: 'rgba(240, 187, 0, 0.35)',
          iconColor: '#8B6500',
          textColor: '#111827'
        };
      }
    } else {
      // Dark theme - existing styling
      if (log.workOrderType === 'sequence') {
        return {
          background: 'linear-gradient(120deg, rgba(0, 199, 183, 0.12) 0%, rgba(0, 199, 183, 0.04) 100%)',
          borderClass: 'border-secondary/30',
          iconBg: 'rgba(0, 199, 183, 0.2)',
          iconColor: '#00E5D0',
          textColor: 'var(--foreground)'
        };
      } else if (log.workOrderType === 'direct') {
        return {
          background: 'linear-gradient(120deg, rgba(75, 92, 251, 0.12) 0%, rgba(75, 92, 251, 0.04) 100%)',
          borderClass: 'border-primary/30',
          iconBg: 'rgba(75, 92, 251, 0.2)',
          iconColor: '#6B7CFF',
          textColor: 'var(--foreground)'
        };
      } else {
        return {
          background: 'linear-gradient(120deg, rgba(240, 187, 0, 0.12) 0%, rgba(240, 187, 0, 0.04) 100%)',
          borderClass: 'border-accent/30',
          iconBg: 'rgba(240, 187, 0, 0.2)',
          iconColor: '#FFD666',
          textColor: 'var(--foreground)'
        };
      }
    }
  };

  // Helper function to get meeting card styles
  const getMeetingStyles = (meeting: ScheduledMeeting) => {
    if (isLightTheme) {
      // Light theme - better contrast with darker colors and stronger borders
      if (meeting.status === 'auto-logged') {
        return {
          background: 'linear-gradient(120deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.12) 100%)',
          borderClass: 'border-purple-500/50 shadow-sm',
          iconBg: 'rgba(139, 92, 246, 0.35)',
          iconColor: '#6D28D9',
          textColor: '#111827'
        };
      }
      return {
        background: 'linear-gradient(120deg, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0.12) 100%)',
        borderClass: 'border-yellow-500/50 shadow-sm',
        iconBg: 'rgba(234, 179, 8, 0.35)',
        iconColor: '#A16207',
        textColor: '#111827'
      };
    } else {
      // Dark theme - existing styling
      if (meeting.status === 'auto-logged') {
        return {
          background: 'linear-gradient(120deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 100%)',
          borderClass: 'border-purple-500/30',
          iconBg: 'rgba(139, 92, 246, 0.2)',
          iconColor: '#A78BFA',
          textColor: 'var(--foreground)'
        };
      }
      return {
        background: 'linear-gradient(120deg, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0.04) 100%)',
        borderClass: 'border-yellow-500/30',
        iconBg: 'rgba(234, 179, 8, 0.2)',
        iconColor: '#FACC15',
        textColor: 'var(--foreground)'
      };
    }
  };

  return (
    <div className="px-4 pt-4 max-w-md mx-auto w-full">
      {/* Timeline */}
      <div className="space-y-2 w-full">
        {hours.map(hour => {
          const hourStart = new Date(date);
          hourStart.setHours(hour, 0, 0, 0);
          const hourEnd = new Date(date);
          hourEnd.setHours(hour + 1, 0, 0, 0);

          // Find events in this hour
          const hourMeetings = meetings.filter(m => 
            (m.start >= hourStart && m.start < hourEnd) ||
            (m.end > hourStart && m.end <= hourEnd) ||
            (m.start <= hourStart && m.end >= hourEnd)
          );

          const hourLogs = timeLogs.filter(l => 
            (l.start >= hourStart && l.start < hourEnd) ||
            (l.end && l.end > hourStart && l.end <= hourEnd) ||
            (l.start <= hourStart && (!l.end || l.end >= hourEnd))
          );

          // Don't show empty hours if nothing is there
          if (hourMeetings.length === 0 && hourLogs.length === 0) {
            return null;
          }

          return (
            <div key={hour} className="flex gap-3 w-full">
              {/* Time label */}
              <div className="w-14 shrink-0 pt-1">
                <span className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>

              {/* Events */}
              <div className="flex-1 min-w-0 border-l-2 border-border/20 pl-3 space-y-1.5 pb-2">
                {/* Scheduled meetings */}
                {tabMode !== 'timelogs' && hourMeetings.map(meeting => {
                  const styles = getMeetingStyles(meeting);
                  return (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-lg cursor-pointer overflow-hidden border ${styles.borderClass}`}
                      style={{
                        background: styles.background,
                      }}
                      onClick={() => setSelectedMeeting(meeting)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-2">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ 
                            background: styles.iconBg
                          }}
                        >
                          <Video className="w-3.5 h-3.5" style={{ color: styles.iconColor }} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs truncate" style={{ fontWeight: 600, color: styles.textColor }}>
                              {meeting.title}
                            </p>
                            {meeting.status === 'auto-logged' && (
                              <CheckCircle2 className="w-3 h-3 text-secondary shrink-0" strokeWidth={2} />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground" style={{ fontWeight: 500, fontSize: '10px' }}>
                            {meeting.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {meeting.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ 
                              fontWeight: 600,
                              fontSize: '10px',
                              color: isLightTheme 
                                ? (meeting.status === 'auto-logged' ? '#6D28D9' : '#A16207')
                                : (meeting.status === 'auto-logged' ? '#A78BFA' : '#FACC15')
                            }}>
                              {meeting.attendees} attendees
                            </span>
                            <span className="text-xs text-muted-foreground" style={{ fontWeight: 500, fontSize: '10px' }}>
                              • {meeting.source === 'google' ? 'Google' : 'Microsoft'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Time logs */}
                {tabMode !== 'meetings' && hourLogs.map(log => {
                  const styles = getTimeLogStyles(log);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-lg overflow-hidden cursor-pointer border ${styles.borderClass}`}
                      style={{
                        background: styles.background,
                      }}
                      whileHover={{ scale: 1.01, opacity: 1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-2">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ 
                            background: styles.iconBg
                          }}
                        >
                          {log.type === 'meeting' ? (
                            <Video className="w-3.5 h-3.5" style={{ color: styles.iconColor }} strokeWidth={2} />
                          ) : (
                            <Code className="w-3.5 h-3.5" style={{ color: styles.iconColor }} strokeWidth={2} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs truncate" style={{ fontWeight: 600, color: styles.textColor }}>
                              {log.description}
                            </p>
                            {log.status === 'running' && (
                              <Circle className="w-2 h-2 text-green-400 fill-green-400 shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground" style={{ fontWeight: 500, fontSize: '10px' }}>
                            {log.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} 
                            {log.end && ` - ${log.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                            {log.status === 'running' && ' - Running'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ fontWeight: 600, fontSize: '10px', color: styles.iconColor }}>
                              {log.workOrder}
                            </span>
                            <span className="text-xs text-muted-foreground" style={{ fontWeight: 500, fontSize: '10px' }}>
                              • {log.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting Detail Sheet */}
      <MeetingDetailSheet
        meeting={selectedMeeting}
        open={selectedMeeting !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMeeting(null);
        }}
      />
    </div>
  );
};

// Horizontal Day Selector Component
const HorizontalDaySelector = ({ 
  currentDate, 
  onDateSelect 
}: { 
  currentDate: Date; 
  onDateSelect: (date: Date) => void;
}) => {
  // Generate array of 15 days (7 before, current, 7 after)
  const days = [];
  for (let i = -7; i <= 7; i++) {
    const day = new Date(currentDate);
    day.setDate(currentDate.getDate() + i);
    days.push(day);
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date.toDateString());
    console.log('Current date before:', currentDate.toDateString());
    onDateSelect(new Date(date.getTime())); // Create new Date object to force re-render
    console.log('Date updated');
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    onDateSelect(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    onDateSelect(newDate);
  };

  return (
    <div className="mb-3">
      {/* Month/Year Selector */}
      <div className="flex items-center justify-between mb-3 px-2">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 hover:bg-muted rounded-lg transition-all"
          aria-label="Previous month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <h3 className="text-sm" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1.5 hover:bg-muted rounded-lg transition-all"
          aria-label="Next month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Horizontal Scrollable Days */}
      <div className="-mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
          {days.map((day, index) => {
            const selected = isSelected(day);
            const today = isToday(day);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className="flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] transition-all shrink-0 relative"
                style={{
                  background: selected 
                    ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.35) 0%, rgba(0, 199, 183, 0.35) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  scrollSnapAlign: 'center',
                  transform: selected ? 'scale(1.05)' : 'scale(1)',
                  ...(selected && {
                    boxShadow: '0 0 30px rgba(75, 92, 251, 0.6), 0 0 60px rgba(0, 199, 183, 0.4), inset 0 0 30px rgba(75, 92, 251, 0.2)'
                  })
                }}
              >
                {/* Gradient border for selected */}
                {selected && (
                  <div 
                    className="absolute inset-0 rounded-xl p-[2px]"
                    style={{
                      background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      pointerEvents: 'none'
                    }}
                  />
                )}
                {/* Today border */}
                {!selected && today && (
                  <div 
                    className="absolute inset-0 rounded-xl"
                    style={{
                      border: '1px solid rgba(75, 92, 251, 0.5)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
                {/* Default border */}
                {!selected && !today && (
                  <div 
                    className="absolute inset-0 rounded-xl"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
                
                <span 
                  className="text-xs mb-0.5 relative z-10" 
                  style={{ 
                    fontWeight: 600,
                    color: selected ? '#6B7CFF' : today ? '#6B7CFF' : 'var(--muted-foreground)'
                  }}
                >
                  {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </span>
                <span 
                  className="text-lg relative z-10" 
                  style={{ 
                    fontWeight: 700,
                    color: selected ? '#FFFFFF' : today ? '#6B7CFF' : 'var(--foreground)'
                  }}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};