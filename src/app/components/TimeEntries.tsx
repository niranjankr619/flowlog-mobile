import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Calendar, Trash2, Clock, RotateCcw, Edit3, Filter, Users, List, MessageSquare, Lock, Briefcase, ChevronRight } from 'lucide-react';
import { useApp, canEditEntry } from '../lib/AppContext';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { mockRecentOthersActivities, mockTimeEntries } from '../lib/mockData';
import { BottomNav } from './BottomNav';
import { QuickEditModal } from './QuickEditModal';

export const TimeEntries = () => {
  const { setCurrentScreen, recentEntries, setRecentEntries, setSelectedEntry, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'all' | 'collaborative'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [workOrderTypeFilter, setWorkOrderTypeFilter] = useState<string[]>([]);
  const [billableFilter, setBillableFilter] = useState<'all' | 'billable' | 'non-billable'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [swipedEntryId, setSwipedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<typeof mockRecentOthersActivities[0] | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [justEditedId, setJustEditedId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Combine all entries from different sources with truly unique IDs
  const allTimeEntries = [
    ...recentEntries.map((e, idx) => ({ ...e, id: `recent-entry-${idx}-${e.id}` })),
    ...mockRecentOthersActivities.map((e, idx) => ({ ...e, id: `others-entry-${idx}-${e.id}` })),
    ...mockTimeEntries.map((e, idx) => ({ ...e, id: `mock-entry-${idx}-${e.id}` }))
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date('2025-10-25');
    const yesterday = new Date('2025-10-24');

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
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

  // Apply view filter first
  let viewFilteredEntries = allTimeEntries;
  // Show all entries - both collaborative and non-collaborative

  // Apply other filters
  const filteredEntries = viewFilteredEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const today = new Date('2025-10-25');
    const yesterday = new Date('2025-10-24');
    const weekStart = new Date('2025-10-20');
    const monthStart = new Date('2025-10-01');

    // Date filter
    let dateMatch = true;
    switch (dateFilter) {
      case 'today':
        dateMatch = entryDate.toDateString() === today.toDateString();
        break;
      case 'yesterday':
        dateMatch = entryDate.toDateString() === yesterday.toDateString();
        break;
      case 'week':
        dateMatch = entryDate >= weekStart && entryDate <= today;
        break;
      case 'month':
        dateMatch = entryDate >= monthStart && entryDate <= today;
        break;
    }

    // Work Order Type filter
    const workOrderTypeMatch = workOrderTypeFilter.length === 0 || 
      workOrderTypeFilter.includes(entry.workOrderType || 'general');

    // Billable filter
    const billableMatch = billableFilter === 'all' || 
      (billableFilter === 'billable' && entry.billable) ||
      (billableFilter === 'non-billable' && !entry.billable);

    // Search filter
    const searchMatch = searchQuery === '' || 
      entry.task?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.activityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.workOrderId?.toLowerCase().includes(searchQuery.toLowerCase());

    return dateMatch && workOrderTypeMatch && billableMatch && searchMatch;
  });

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof filteredEntries>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const handleDeleteEntry = (entryId: string) => {
    const originalId = entryId.replace(/^(recent|others|mock)-entry-\d+-/, '');
    setRecentEntries(prev => prev.filter(e => e.id !== originalId));
    toast.success('Entry deleted');
    setSwipedEntryId(null);
  };

  const handleEditEntry = (entry: any) => {
    const originalEntry = { ...entry, id: entry.id.replace(/^(recent|others|mock)-entry-\d+-/, '') };
    setEditingEntry(originalEntry);
    setIsQuickEditOpen(true);
    setSwipedEntryId(null);
  };

  const handleSaveEdit = (updatedEntry: any) => {
    setRecentEntries(prev => prev.map(e => 
      e.id === updatedEntry.id ? updatedEntry : e
    ));
    setJustEditedId(`recent-entry-0-${updatedEntry.id}`);
    setTimeout(() => setJustEditedId(null), 2000);
    toast.success('Entry updated');
  };

  const handleEntryClick = (entry: any) => {
    if (swipedEntryId === entry.id) {
      setSwipedEntryId(null);
      return;
    }
    const originalEntry = { ...entry, id: entry.id.replace(/^(recent|others|mock)-entry-\d+-/, '') };
    setSelectedEntry(originalEntry);
    setCurrentScreen('entry-detail');
  };

  const handleLongPressStart = (entry: any) => {
    longPressTimerRef.current = setTimeout(() => {
      handleEditEntry(entry);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const clearAllFilters = () => {
    setDateFilter('all');
    setWorkOrderTypeFilter([]);
    setBillableFilter('all');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (dateFilter !== 'all' ? 1 : 0) +
    (workOrderTypeFilter.length > 0 ? 1 : 0) +
    (billableFilter !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/50">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 rounded-lg hover:bg-muted transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Time Entries
            </h2>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-3"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  className="ml-2 px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center"
                  style={{ backgroundColor: '#4B5CFB', color: 'white' }}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="px-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Quick Link to Sub Work Orders */}
          <button
            onClick={() => setCurrentScreen('my-sub-work-orders')}
            className="w-full mb-3 p-2.5 rounded-lg glass-card hover:border-primary/50 transition-all flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              <span style={{ fontWeight: 600 }}>My Sub Work Orders</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          </button>

          {/* Filter Overlay */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                  style={{ top: 0, left: 0 }}
                />
                
                {/* Filter Panel */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 flex flex-col"
                  style={{ 
                    height: '70vh', 
                    maxHeight: '70vh',
                    bottom: '80px' // Above the bottom nav (approx height of nav + safe area)
                  }}
                >
                  {/* Handle */}
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-4 flex-shrink-0" />
                  
                  <h3 className="text-base mt-4 mb-3 px-4 flex-shrink-0" style={{ fontWeight: 700 }}>
                    Filter Options
                  </h3>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto px-4 min-h-0">
                    <div className="space-y-4">
                      {/* Date Filter */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2" style={{ fontWeight: 600 }}>DATE RANGE</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['all', 'today', 'yesterday', 'week', 'month'] as const).map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setDateFilter(filter)}
                              className={`px-3 py-2 rounded-lg text-xs transition-all ${
                                dateFilter === filter
                                  ? 'text-white border-0'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                              style={dateFilter === filter ? {
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)'
                              } : { fontWeight: 600 }}
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Work Order Type Filter */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2" style={{ fontWeight: 600 }}>WORK ORDER TYPE</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['all', 'direct', 'sequence', 'meeting', 'general', 'sub-work-order'] as const).map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setWorkOrderTypeFilter(filter)}
                              className={`px-3 py-2 rounded-lg text-xs transition-all ${
                                workOrderTypeFilter === filter
                                  ? 'text-white border-0'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                              style={workOrderTypeFilter === filter ? {
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)'
                              } : { fontWeight: 600 }}
                            >
                              {filter === 'sub-work-order' ? 'Sub Work Order' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Billable Filter */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2" style={{ fontWeight: 600 }}>BILLABLE STATUS</p>
                        <div className="flex gap-2">
                          {(['all', 'billable', 'non-billable'] as const).map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setBillableFilter(filter)}
                              className={`px-3 py-2 rounded-lg text-xs transition-all ${
                                billableFilter === filter
                                  ? 'text-white border-0'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                              style={billableFilter === filter ? {
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)'
                              } : { fontWeight: 600 }}
                            >
                              {filter === 'non-billable' ? 'Non-Billable' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Button - Fixed at bottom */}
                  <div className="flex-shrink-0 px-4 py-4 pb-6 border-t border-border/20 bg-card">
                    <motion.button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-4 rounded-2xl text-white shadow-xl text-center"
                      style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)',
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply Filters
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto pb-20 safe-bottom">
        <div className="px-4 pt-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No entries found</p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => {
                const isLightTheme = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
                
                return (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                        {formatDate(date).toUpperCase()}
                      </p>
                      <div className="flex-1 h-px bg-border/30" />
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(groupedEntries[date].reduce((sum, e) => sum + (e.duration || 0), 0))}
                      </p>
                    </div>

                    {/* Entries for this date */}
                    <div className="space-y-2.5">
                      {groupedEntries[date].map((entry, index) => {
                        // Determine background gradient and colors based on entry type
                        const getEntryStyle = () => {
                          if (entry.workOrderType === 'meeting') {
                            // Special violet styling for meetings
                            return {
                              background: 'linear-gradient(120deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 100%)',
                              border: 'border-purple-500/30',
                              overlayClass: 'from-purple-500/15',
                            };
                          } else if (entry.workOrderType === 'sequence') {
                            return {
                              background: 'linear-gradient(120deg, rgba(0, 199, 183, 0.12) 0%, rgba(0, 199, 183, 0.04) 100%)',
                              border: 'border-secondary/30',
                              overlayClass: 'from-secondary/15',
                            };
                          } else if (entry.workOrderType === 'direct') {
                            return {
                              background: 'linear-gradient(120deg, rgba(75, 92, 251, 0.12) 0%, rgba(75, 92, 251, 0.04) 100%)',
                              border: 'border-primary/30',
                              overlayClass: 'from-primary/15',
                            };
                          } else {
                            return {
                              background: 'linear-gradient(120deg, rgba(240, 187, 0, 0.12) 0%, rgba(240, 187, 0, 0.04) 100%)',
                              border: 'border-accent/30',
                              overlayClass: 'from-accent/15',
                            };
                          }
                        };

                        // Get badge style with better contrast for light theme
                        const getBadgeStyle = () => {
                          if (isLightTheme) {
                            if (entry.workOrderType === 'meeting') {
                              return {
                                backgroundColor: '#8B5CF660',
                                color: '#5B21B6',
                                border: '1px solid #8B5CF6',
                              };
                            } else if (entry.workOrderType === 'sequence') {
                              return {
                                backgroundColor: '#00C7B760',
                                color: '#006B5F',
                                border: '1px solid #00C7B7',
                              };
                            } else if (entry.workOrderType === 'direct') {
                              return {
                                backgroundColor: '#4B5CFB60',
                                color: '#2A3BB7',
                                border: '1px solid #4B5CFB',
                              };
                            } else {
                              return {
                                backgroundColor: '#F0BB0060',
                                color: '#8B6500',
                                border: '1px solid #F0BB00',
                              };
                            }
                          } else {
                            return {
                              backgroundColor: entry.workOrderType === 'meeting'
                                ? '#8B5CF630'
                                : entry.workOrderType === 'sequence' 
                                  ? '#00C7B730' 
                                  : entry.workOrderType === 'direct' 
                                    ? '#4B5CFB30' 
                                    : '#F0BB0030',
                              color: entry.workOrderType === 'meeting'
                                ? '#A78BFA'
                                : entry.workOrderType === 'sequence' 
                                  ? '#00E5D0' 
                                  : entry.workOrderType === 'direct' 
                                    ? '#6B7CFF' 
                                    : '#FFD666',
                              border: entry.workOrderType === 'meeting'
                                ? '1px solid #8B5CF680'
                                : entry.workOrderType === 'sequence' 
                                  ? '1px solid #00C7B780' 
                                  : entry.workOrderType === 'direct' 
                                    ? '1px solid #4B5CFB80' 
                                    : '1px solid #F0BB0080',
                            };
                          }
                        };

                        const style = getEntryStyle();
                        const badgeStyle = getBadgeStyle();
                        const isSwiped = swipedEntryId === entry.id;
                        
                        // Check if entry is locked (>24 hours old)
                        const editCheck = canEditEntry(entry);
                        const isLocked = !editCheck.canEdit;

                        return (
                          <motion.div
                            key={entry.id}
                            className="relative h-[104px] overflow-hidden"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            {/* Edit & Delete Button Background */}
                            <AnimatePresence>
                              {isSwiped && !isLocked && (
                                <motion.div
                                  className="absolute inset-0 rounded-xl flex items-center justify-end px-4 gap-3"
                                  style={{
                                    background: 'linear-gradient(90deg, rgba(75, 92, 251, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <motion.button
                                    onClick={() => {
                                      handleEditEntry(entry);
                                    }}
                                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Edit3 className="w-4 h-4 text-white" strokeWidth={2} />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center shadow-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 className="w-4 h-4 text-white" strokeWidth={2} />
                                  </motion.button>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Entry Card - Swipeable */}
                            <motion.div
                              drag={isLocked ? false : "x"}
                              dragConstraints={{ left: -140, right: 0 }}
                              dragElastic={0.2}
                              onDragEnd={(e, info) => {
                                if (!isLocked && info.offset.x < -60) {
                                  setSwipedEntryId(entry.id);
                                } else {
                                  setSwipedEntryId(null);
                                }
                              }}
                              onPointerDown={() => !isLocked && handleLongPressStart(entry)}
                              onPointerUp={handleLongPressEnd}
                              onPointerLeave={handleLongPressEnd}
                              animate={{
                                x: isSwiped && !isLocked ? -120 : 0,
                                boxShadow: justEditedId === entry.id 
                                  ? '0 0 30px rgba(75, 92, 251, 0.4)' 
                                  : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              }}
                              className={`absolute inset-0 rounded-xl glass-card border-2 ${
                                justEditedId === entry.id ? 'border-primary/60' : style.border
                              } cursor-pointer overflow-hidden`}
                              style={{
                                background: style.background,
                                backdropFilter: 'blur(20px)',
                              }}
                              onClick={() => handleEntryClick(entry)}
                              whileHover={{ scale: isSwiped ? 1 : 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              {/* Left-to-right gradient overlay */}
                              <div className={`absolute inset-0 bg-gradient-to-r ${style.overlayClass} to-transparent pointer-events-none rounded-xl`} />
                              
                              {/* Content wrapper with padding to respect rounded corners */}
                              <div className="relative z-10 h-full flex items-center pl-5 pr-4">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge
                                      className="text-xs px-2 py-0.5 shrink-0"
                                      style={{
                                        backgroundColor: badgeStyle.backgroundColor,
                                        color: badgeStyle.color,
                                        fontWeight: 600,
                                        border: badgeStyle.border,
                                      }}
                                    >
                                      {entry.workOrderType === 'meeting'
                                        ? 'Meeting'
                                        : entry.workOrderType === 'sequence' 
                                          ? 'Sequence' 
                                          : entry.workOrderType === 'direct' 
                                            ? 'Direct' 
                                            : 'General'}
                                    </Badge>
                                    {(entry as any).editedAt && (
                                      <span className="text-[10px] text-muted-foreground/60 shrink-0" style={{ fontWeight: 500 }}>
                                        🕓 Edited {new Date((entry as any).editedAt).toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          hour12: false 
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm mb-2 truncate" style={{ fontWeight: 600 }}>
                                    {entry.task || entry.description || entry.activityName}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Calendar className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(entry.date)}
                                      </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">•</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                                      <p className="text-xs text-muted-foreground">
                                        {entry.startTime && entry.endTime 
                                          ? `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`
                                          : formatDuration(entry.duration)
                                        }
                                      </p>
                                    </div>
                                    {entry.billable && (
                                      <>
                                        <span className="text-xs text-muted-foreground shrink-0">•</span>
                                        <p className="text-xs text-muted-foreground shrink-0">
                                          Billable
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingEntry && (
        <QuickEditModal
          isOpen={isQuickEditOpen}
          onClose={() => {
            setIsQuickEditOpen(false);
            setEditingEntry(null);
          }}
          entry={editingEntry}
          onSave={handleSaveEdit}
        />
      )}

      <BottomNav />
    </div>
  );
};