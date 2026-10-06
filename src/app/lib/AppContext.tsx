import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockRecentOthersActivities, users, mockSubWorkOrders } from './mockData';

// Helper: Check if entry can be edited (within 24 hours)
export const canEditEntry = (entry: any): { canEdit: boolean; reason?: string } => {
  // If entry has a loggedAt timestamp, use that
  if (entry.loggedAt) {
    const loggedTime = new Date(entry.loggedAt);
    const now = new Date();
    const hoursSinceLogged = (now.getTime() - loggedTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLogged > 24) {
      return { 
        canEdit: false, 
        reason: 'Entry locked - can only edit within 24 hours of logging' 
      };
    }
    return { canEdit: true };
  }
  
  // Fallback: Use date + endTime if no loggedAt
  if (!entry.date) {
    return { canEdit: true }; // If no date, allow edit
  }

  // Parse the date - handle both ISO strings and date-only strings
  let entryDate: Date;
  if (entry.date.includes('T')) {
    // ISO datetime string
    entryDate = new Date(entry.date);
  } else {
    // Date-only string like "2024-11-12"
    // Use end of day for the entry if we have endTime
    if (entry.endTime) {
      entryDate = new Date(`${entry.date}T${entry.endTime}`);
    } else {
      // No time info, use end of day
      entryDate = new Date(`${entry.date}T23:59:59`);
    }
  }
  
  const now = new Date();
  const hoursSinceEntry = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);

  if (hoursSinceEntry > 24) {
    return { 
      canEdit: false, 
      reason: 'Entry locked - can only edit within 24 hours of logging' 
    };
  }

  return { canEdit: true };
};

// Helper: Check for time overlaps
export const checkTimeOverlap = (
  newEntry: { date: string; startTime: string; endTime: string },
  existingEntries: any[],
  excludeEntryId?: string
): { hasOverlap: boolean; conflictingEntry?: any; reason?: string } => {
  // Normalize date to YYYY-MM-DD format for comparison
  const normalizeDate = (dateStr: string): string => {
    if (dateStr.includes('T')) {
      // ISO datetime string - extract date part
      return dateStr.split('T')[0];
    }
    // Already in YYYY-MM-DD format
    return dateStr;
  };

  const newEntryDate = normalizeDate(newEntry.date);

  // Filter entries for the same date (excluding the entry being edited)
  const entriesOnSameDate = existingEntries.filter(entry => {
    const entryDate = normalizeDate(entry.date);
    return entryDate === newEntryDate && entry.id !== excludeEntryId;
  });

  // Convert time strings to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newStart = timeToMinutes(newEntry.startTime);
  const newEnd = timeToMinutes(newEntry.endTime);

  // Check each existing entry for overlap
  for (const entry of entriesOnSameDate) {
    if (!entry.startTime || !entry.endTime) continue;

    const existingStart = timeToMinutes(entry.startTime);
    const existingEnd = timeToMinutes(entry.endTime);

    // Check if time ranges overlap
    const overlaps = 
      (newStart >= existingStart && newStart < existingEnd) ||  // New start is within existing
      (newEnd > existingStart && newEnd <= existingEnd) ||      // New end is within existing
      (newStart <= existingStart && newEnd >= existingEnd);     // New completely contains existing

    if (overlaps) {
      return {
        hasOverlap: true,
        conflictingEntry: entry,
        reason: `Time overlaps with existing entry: ${entry.task || entry.description || entry.activityName} (${entry.startTime} - ${entry.endTime})`
      };
    }
  }

  return { hasOverlap: false };
};

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  taskName: string;
  workOrderId: string | null;
  activityType: 'work-order' | 'quick-activity' | null;
  activityId: string | null; // For quick activities like lunch, meeting, etc.
  activityReason: string; // For 'other' activity type
  category: string;
  billable: boolean;
  rate: number;
  // New: Collaboration fields
  workOrderOwner?: string | null; // Owner user ID if logging on someone else's work order
  workOrderOwnerName?: string | null; // Owner name for display
  isCollaborative?: boolean; // Flag to indicate collaborative logging
}

interface AppContextType {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  timerState: TimerState;
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  selectedEntry: any | null;
  setSelectedEntry: (entry: any | null) => void;
  workOrderInitialTab: 'all' | 'direct' | 'sequence' | 'collaborative' | 'others' | 'work-orders';
  setWorkOrderInitialTab: (tab: 'all' | 'direct' | 'sequence' | 'collaborative' | 'others' | 'work-orders') => void;
  selectedOthersActivity: any | null;
  setSelectedOthersActivity: (activity: any | null) => void;
  isZenMode: boolean;
  setIsZenMode: (isZen: boolean) => void;
  recentEntries: any[];
  setRecentEntries: React.Dispatch<React.SetStateAction<any[]>>;
  isEditingEntry: boolean;
  setIsEditingEntry: (isEditing: boolean) => void;
  // New: Current user for account switching
  currentUser: typeof users.niranjan;
  setCurrentUser: React.Dispatch<React.SetStateAction<typeof users.niranjan>>;
  // New: Sub Work Orders management
  subWorkOrders: typeof mockSubWorkOrders;
  setSubWorkOrders: React.Dispatch<React.SetStateAction<typeof mockSubWorkOrders>>;
  selectedWorkOrderForRequest: any | null;
  setSelectedWorkOrderForRequest: (workOrder: any | null) => void;
  selectedWorkOrderForAssignment: any | null;
  setSelectedWorkOrderForAssignment: (workOrder: any | null) => void;
  // Deliverable upload trigger
  shouldOpenDeliverableUpload: boolean;
  setShouldOpenDeliverableUpload: (should: boolean) => void;
  pendingDeliverableEntry: any | null;
  setPendingDeliverableEntry: (entry: any | null) => void;
  // Paused timer state for resuming after deliverable upload cancel
  pausedTimerState: TimerState | null;
  setPausedTimerState: (state: TimerState | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  console.log('AppProvider initializing...');
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [workOrderInitialTab, setWorkOrderInitialTab] = useState<'all' | 'direct' | 'sequence' | 'collaborative' | 'others' | 'work-orders'>('direct');
  const [selectedOthersActivity, setSelectedOthersActivity] = useState<any | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>(mockRecentOthersActivities);
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  
  // New: Current user state - default to Niranjan
  const [currentUser, setCurrentUser] = useState<typeof users.niranjan>(users.niranjan);
  
  // New: Sub Work Orders state
  const [subWorkOrders, setSubWorkOrders] = useState<typeof mockSubWorkOrders>(mockSubWorkOrders);
  const [selectedWorkOrderForRequest, setSelectedWorkOrderForRequest] = useState<any | null>(null);
  const [selectedWorkOrderForAssignment, setSelectedWorkOrderForAssignment] = useState<any | null>(null);
  
  // Deliverable upload trigger
  const [shouldOpenDeliverableUpload, setShouldOpenDeliverableUpload] = useState(false);
  const [pendingDeliverableEntry, setPendingDeliverableEntry] = useState<any | null>(null);
  
  // Paused timer state for resuming after deliverable upload cancel
  const [pausedTimerState, setPausedTimerState] = useState<TimerState | null>(null);
  
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
    taskName: '',
    workOrderId: null,
    activityType: null,
    activityId: null,
    activityReason: '',
    category: 'work',
    billable: false,
    rate: 0,
  });

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        timerState,
        setTimerState,
        theme,
        setTheme,
        showSplash,
        setShowSplash,
        selectedEntry,
        setSelectedEntry,
        workOrderInitialTab,
        setWorkOrderInitialTab,
        selectedOthersActivity,
        setSelectedOthersActivity,
        isZenMode,
        setIsZenMode,
        recentEntries,
        setRecentEntries,
        isEditingEntry,
        setIsEditingEntry,
        currentUser,
        setCurrentUser,
        subWorkOrders,
        setSubWorkOrders,
        selectedWorkOrderForRequest,
        setSelectedWorkOrderForRequest,
        selectedWorkOrderForAssignment,
        setSelectedWorkOrderForAssignment,
        shouldOpenDeliverableUpload,
        setShouldOpenDeliverableUpload,
        pendingDeliverableEntry,
        setPendingDeliverableEntry,
        pausedTimerState,
        setPausedTimerState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};