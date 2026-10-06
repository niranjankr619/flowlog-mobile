import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, ChevronDown, ChevronUp, Check, X, Minus, Plus, History, TrendingUp, Target, Lock, Paperclip, Upload, FileText } from 'lucide-react';
import { useApp, canEditEntry, checkTimeOverlap } from '../lib/AppContext';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { toast } from 'sonner@2.0.3';
import { mockWorkOrders, mockOtherActivities } from '../lib/mockData';
import { BottomNav } from './BottomNav';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const m = parseInt(minutes);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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

export const EntryDetails = () => {
  const { selectedEntry, setSelectedEntry, setCurrentScreen, setIsEditingEntry, theme, recentEntries, currentUser, setRecentEntries, subWorkOrders } = useApp();
  
  // Sync selectedEntry with recentEntries updates (for approval status changes)
  useEffect(() => {
    if (selectedEntry) {
      const updatedEntry = recentEntries.find(e => e.id === selectedEntry.id);
      if (updatedEntry && JSON.stringify(updatedEntry) !== JSON.stringify(selectedEntry)) {
        setSelectedEntry(updatedEntry);
      }
    }
  }, [recentEntries, selectedEntry, setSelectedEntry]);
  
  const [description, setDescription] = useState(selectedEntry?.description || '');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [showPastEntries, setShowPastEntries] = useState(false);
  
  // Approval states
  const [isApprovingTime, setIsApprovingTime] = useState(false);
  const [approvalMinutes, setApprovalMinutes] = useState(0);
  const [approvalSliderValue, setApprovalSliderValue] = useState([0]);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Deliverables upload states
  const [showDeliverableUpload, setShowDeliverableUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deliverableNotes, setDeliverableNotes] = useState('');
  
  // Time states
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState(0);
  
  // Slider values (represents minutes from start of day - [startTime, endTime])
  const [sliderValues, setSliderValues] = useState([540, 1020]); // Default 9:00 AM to 5:00 PM
  
  // Theme-aware styling for better contrast in light mode
  const isLightTheme = theme === 'light';
  const sectionGradient = isLightTheme
    ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.06) 0%, rgba(0, 199, 183, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(75, 92, 251, 0.18) 0%, rgba(0, 199, 183, 0.14) 100%)';
  const durationGradient = isLightTheme
    ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.08) 0%, rgba(0, 199, 183, 0.07) 100%)'
    : 'linear-gradient(135deg, rgba(75, 92, 251, 0.22) 0%, rgba(0, 199, 183, 0.22) 100%)';
  const billableGradient = isLightTheme
    ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.06) 0%, rgba(0, 199, 183, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(75, 92, 251, 0.22) 0%, rgba(0, 199, 183, 0.18) 100%)';
  const borderOpacity = isLightTheme ? 'border-border/30' : 'border-border/50';
  const inputBg = isLightTheme ? 'bg-background/70' : 'bg-background/45';
  const textareaBg = isLightTheme ? 'bg-background/35' : 'bg-background/20';
  const buttonBg = isLightTheme ? 'bg-background/60' : 'bg-background/50';
  const buttonBgHover = isLightTheme ? 'hover:bg-background/80' : 'hover:bg-background/70';
  const durationBorder = isLightTheme ? 'rgba(75, 92, 251, 0.2)' : 'rgba(75, 92, 251, 0.4)';

  useEffect(() => {
    if (selectedEntry) {
      setDescription(selectedEntry.description || '');
      
      // Initialize times
      const start = selectedEntry.startTime || '09:00';
      const end = selectedEntry.endTime || '17:00';
      setStartTime(start);
      setEndTime(end);
      
      // Calculate duration
      const startMins = timeToMinutes(start);
      const endMins = timeToMinutes(end);
      const dur = endMins - startMins;
      setDuration(dur > 0 ? dur : 0);
      setSliderValues([startMins, endMins]);
    }
  }, [selectedEntry]);

  // Update duration when times change
  useEffect(() => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const dur = endMins - startMins;
    setDuration(dur > 0 ? dur : 0);
  }, [startTime, endTime]);

  const handleBack = () => {
    setSelectedEntry(null);
    setCurrentScreen('home');
  };

  const handleEditTime = () => {
    // Check if entry is locked
    if (!selectedEntry) return;
    
    const editCheck = canEditEntry(selectedEntry);
    if (!editCheck.canEdit) {
      toast.error('Entry Locked', {
        description: editCheck.reason,
        duration: 4000,
      });
      return;
    }
    
    setIsEditingTime(true);
    setSliderValues([timeToMinutes(startTime), timeToMinutes(endTime)]);
  };

  const handleSaveTime = () => {
    if (!selectedEntry) return;

    // Check if entry is locked (double check)
    const editCheck = canEditEntry(selectedEntry);
    if (!editCheck.canEdit) {
      toast.error('Entry Locked', {
        description: editCheck.reason,
        duration: 4000,
      });
      setIsEditingTime(false);
      return;
    }

    // Check for time overlap
    const overlapCheck = checkTimeOverlap(
      { date: selectedEntry.date, startTime, endTime },
      recentEntries,
      selectedEntry.id
    );
    
    if (overlapCheck.hasOverlap) {
      toast.error('Time Overlap Detected', {
        description: overlapCheck.reason,
        duration: 5000,
      });
      return;
    }

    // Update the entry with new times
    const updatedEntry = {
      ...selectedEntry,
      startTime,
      endTime,
      durationMinutes: duration,
      duration: formatDuration(duration),
      description: description,
    };

    // Update in recentEntries array
    setRecentEntries(
      recentEntries.map(entry => 
        entry.id === selectedEntry.id ? updatedEntry : entry
      )
    );

    // Update selectedEntry state
    setSelectedEntry(updatedEntry);

    setIsEditingTime(false);
    toast.success('Time updated', {
      description: `Duration: ${formatDuration(duration)}`,
      duration: 2000,
    });
  };

  const handleCancelTime = () => {
    // Revert to original values
    if (selectedEntry) {
      const start = selectedEntry.startTime || '09:00';
      const end = selectedEntry.endTime || '17:00';
      setStartTime(start);
      setEndTime(end);
      setSliderValues([timeToMinutes(start), timeToMinutes(end)]);
    }
    setIsEditingTime(false);
  };

  const handleSliderChange = (values: number[]) => {
    const [newStartMins, newEndMins] = values;
    
    // Ensure end time is after start time
    if (newEndMins > newStartMins) {
      setSliderValues([newStartMins, newEndMins]);
      setStartTime(minutesToTime(newStartMins));
      setEndTime(minutesToTime(newEndMins));
    }
  };

  const adjustTime = (minutes: number) => {
    const [startMins, endMins] = sliderValues;
    const newEndMins = endMins + minutes;
    
    // Bounds check (0-1440 minutes in a day) and ensure end is after start
    if (newEndMins > startMins && newEndMins <= 1440) {
      setSliderValues([startMins, newEndMins]);
      setEndTime(minutesToTime(newEndMins));
    }
  };

  if (!selectedEntry) {
    return null;
  }

  // Get activity info
  const workOrder = mockWorkOrders.find(wo => wo.number === selectedEntry.activityId);
  const otherActivity = mockOtherActivities.find(oa => oa.id === selectedEntry.activityId);
  
  // Get activity name and type
  const activityName = workOrder?.name || otherActivity?.name || selectedEntry.activityName;
  const activityType = selectedEntry.workOrderType || 'general';
  
  // Filter past entries for this activity (only for direct and sequence)
  const showHistoryButton = activityType === 'direct' || activityType === 'sequence';
  
  // Get the work order owner to check if current user owns this work order
  const workOrderOwner = workOrder?.owner;
  const isWorkOrderOwner = currentUser.id === workOrderOwner;
  
  // Determine if we're viewing a sub work order entry
  const isViewingSubWorkOrder = selectedEntry.isCollaborative && selectedEntry.subWorkOrderId;
  
  const pastEntries = recentEntries.filter(entry => {
    // Skip the current entry itself
    if (entry.id === selectedEntry.id) {
      return false;
    }
    
    // CASE 1: Viewing a SUB work order (collaborative entry)
    // Only show entries from the SAME sub work order
    if (isViewingSubWorkOrder) {
      return entry.subWorkOrderId === selectedEntry.subWorkOrderId && 
             entry.isCollaborative;
    }
    
    // CASE 2: Viewing a MAIN work order (non-collaborative entry)
    // Show own entries + sub work order entries if user is the owner
    if (entry.activityId === selectedEntry.activityId) {
      // Include own non-collaborative entries
      if (!entry.isCollaborative) {
        return true;
      }
      
      // If user is the owner, also include sub work order entries assigned from this WO
      if (isWorkOrderOwner && entry.isCollaborative) {
        const subWO = subWorkOrders.find(swo => 
          swo.id === entry.subWorkOrderId || 
          swo.subWorkOrderNumber === entry.subWorkOrderId
        );
        
        // Include this entry if it's a sub work order assigned from the current work order
        if (subWO && subWO.parentWorkOrderId === selectedEntry.activityId) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  // Calculate total time spent on this activity
  const totalMinutesSpent = pastEntries.reduce((total, entry) => {
    return total + (entry.durationMinutes || 0);
  }, selectedEntry.durationMinutes || 0);
  
  // Get work order details for budget tracking
  const budgetEstimate = workOrder?.estimatedHours || 0;
  const actualHours = workOrder?.actualHours || 0;
  const budgetUtilization = budgetEstimate > 0 ? (actualHours / budgetEstimate) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="px-6 pt-12 pb-4 border-b border-border/30 backdrop-blur-xl sticky top-0 z-10"
        style={{
          background: 'rgba(var(--background-rgb), 0.8)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleBack}
            className="p-2 hover:bg-muted rounded-xl transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </motion.button>
          <div className="flex-1">
            <h1 style={{ fontWeight: 700 }}>Entry Details</h1>
            <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
              {formatDate(selectedEntry.date)}
            </p>
          </div>
          {showHistoryButton && (
            <motion.button
              onClick={() => setShowPastEntries(true)}
              className="p-2 hover:bg-muted rounded-xl transition-all relative"
              whileTap={{ scale: 0.95 }}
            >
              <History className="w-5 h-5" strokeWidth={2} />
              {pastEntries.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-white flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {pastEntries.length}
                </span>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        
        {/* 1️⃣ Linked Activity Block */}
        <motion.div
          className={`rounded-2xl ${borderOpacity} overflow-hidden ${isLightTheme ? 'shadow-sm' : 'shadow-lg'}`}
          style={{
            background: sectionGradient,
            backdropFilter: isLightTheme ? 'blur(20px)' : 'blur(40px)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
        >
          <motion.button
            onClick={() => {
              setIsEditingEntry(true);
              setCurrentScreen('work-order-selector');
            }}
            className="w-full p-5 text-left hover:bg-background/20 transition-colors rounded-2xl"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm flex-1 min-w-0" style={{ fontWeight: 600 }}>
                {activityName}
              </p>
              {selectedEntry.isCollaborative ? (
                // Show owner name for collaborative entries
                <Badge
                  className="text-xs px-2 py-0.5 shrink-0"
                  style={isLightTheme ? {
                    backgroundColor: 'rgba(75, 92, 251, 0.12)',
                    color: '#3443D9',
                    fontWeight: 600,
                    border: '1px solid rgba(75, 92, 251, 0.25)',
                  } : {
                    backgroundColor: 'rgba(75, 92, 251, 0.2)',
                    color: '#4B5CFB',
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  {selectedEntry.workOrderOwnerName}
                </Badge>
              ) : (
                // Show activity type for non-collaborative entries
                <Badge
                  className="text-xs px-2 py-0.5 shrink-0"
                  style={isLightTheme ? {
                    backgroundColor: activityType === 'sequence' 
                      ? 'rgba(0, 199, 183, 0.12)'
                      : activityType === 'direct'
                      ? 'rgba(75, 92, 251, 0.12)'
                      : 'rgba(240, 187, 0, 0.12)',
                    color: activityType === 'sequence'
                      ? '#008C7A'
                      : activityType === 'direct'
                      ? '#3443D9'
                      : '#C89500',
                    fontWeight: 600,
                    border: activityType === 'sequence'
                      ? '1px solid rgba(0, 199, 183, 0.25)'
                      : activityType === 'direct'
                      ? '1px solid rgba(75, 92, 251, 0.25)'
                      : '1px solid rgba(240, 187, 0, 0.25)',
                  } : {
                    backgroundColor: activityType === 'sequence' 
                      ? 'rgba(0, 199, 183, 0.2)'
                      : activityType === 'direct'
                      ? 'rgba(75, 92, 251, 0.2)'
                      : 'rgba(240, 187, 0, 0.2)',
                    color: activityType === 'sequence'
                      ? '#00C7B7'
                      : activityType === 'direct'
                      ? '#4B5CFB'
                      : '#F0BB00',
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  {activityType === 'sequence' ? 'Sequence' : activityType === 'direct' ? 'Direct' : 'General'}
                </Badge>
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Work Order Info - TAT, LEFT, DUE DATE */}
        {workOrder && (
          <motion.div
            className="px-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                    TAT
                  </span>
                  <span className="text-sm" style={{ fontWeight: 700, color: '#00C7B7' }}>
                    {workOrder.estimatedHours ? `${workOrder.estimatedHours}h` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                    LEFT
                  </span>
                  <span className="text-sm" style={{ fontWeight: 700, color: '#00C7B7' }}>
                    {workOrder.estimatedHours && workOrder.actualHours 
                      ? formatDuration(Math.max(0, (workOrder.estimatedHours - workOrder.actualHours) * 60))
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                  DUE
                </span>
                <span className="text-xs" style={{ fontWeight: 700, color: '#F0BB00' }}>
                  {workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2️⃣ Time Section */}
        <motion.div
          className={`rounded-2xl ${borderOpacity} overflow-hidden ${isLightTheme ? 'shadow-sm' : 'shadow-lg'}`}
          style={{
            background: sectionGradient,
            backdropFilter: isLightTheme ? 'blur(20px)' : 'blur(40px)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
        >
          {/* Compact View */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" strokeWidth={2} />
                <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                  TIME
                </span>
              </div>
              <motion.button
                onClick={isEditingTime ? handleCancelTime : handleEditTime}
                className={`text-xs px-3 py-1.5 rounded-lg ${buttonBg} ${buttonBgHover} transition-colors border ${isLightTheme ? 'border-border/50' : borderOpacity}`}
                style={{ fontWeight: 600 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditingTime ? (
                  <span className="flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    Edit Time
                    <ChevronDown className="w-3 h-3" />
                  </span>
                )}
              </motion.button>
            </div>

            {/* Start and End Time Display */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={`p-3 rounded-xl ${inputBg} border ${borderOpacity} ${isLightTheme ? 'shadow-sm' : 'shadow-md'}`}>
                <label className="text-xs text-muted-foreground block mb-1" style={{ fontWeight: 600 }}>
                  Start
                </label>
                {isEditingTime ? (
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      const newStartTime = e.target.value;
                      setStartTime(newStartTime);
                      const newStartMins = timeToMinutes(newStartTime);
                      const [, endMins] = sliderValues;
                      // Adjust slider if needed
                      if (endMins <= newStartMins) {
                        const newEndMins = newStartMins + 30; // Add 30 min buffer
                        setSliderValues([newStartMins, newEndMins]);
                        setEndTime(minutesToTime(newEndMins));
                      } else {
                        setSliderValues([newStartMins, endMins]);
                      }
                    }}
                    className={`${inputBg} ${isLightTheme ? 'border-border/60' : borderOpacity} focus:border-primary/60 h-9 shadow-sm`}
                  />
                ) : (
                  <p style={{ fontWeight: 700 }}>{formatTime(startTime)}</p>
                )}
              </div>

              <div className={`p-3 rounded-xl ${inputBg} border ${borderOpacity} ${isLightTheme ? 'shadow-sm' : 'shadow-md'}`}>
                <label className="text-xs text-muted-foreground block mb-1" style={{ fontWeight: 600 }}>
                  End
                </label>
                {isEditingTime ? (
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      setEndTime(newEndTime);
                      const [startMins] = sliderValues;
                      setSliderValues([startMins, timeToMinutes(newEndTime)]);
                    }}
                    className={`${inputBg} ${isLightTheme ? 'border-border/60' : borderOpacity} focus:border-primary/60 h-9 shadow-sm`}
                  />
                ) : (
                  <p style={{ fontWeight: 700 }}>{formatTime(endTime)}</p>
                )}
              </div>
            </div>

            {/* Duration Display */}
            <motion.div 
              className="p-3 rounded-xl text-center"
              style={{
                background: durationGradient,
                border: `1px solid ${durationBorder}`,
              }}
              animate={{
                boxShadow: isEditingTime 
                  ? isLightTheme 
                    ? '0 0 12px rgba(75, 92, 251, 0.15), 0 0 24px rgba(0, 199, 183, 0.1)'
                    : '0 0 20px rgba(75, 92, 251, 0.3), 0 0 40px rgba(0, 199, 183, 0.2)'
                  : '0 0 0 rgba(75, 92, 251, 0)',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                DURATION
              </span>
              <motion.p 
                className="text-2xl mt-1"
                style={isLightTheme ? { 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3443D9 0%, #008C7A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                } : { 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                key={duration}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatDuration(duration)}
              </motion.p>
            </motion.div>
          </div>

          {/* Expanded Edit View */}
          <AnimatePresence>
            {isEditingTime && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-5 pb-5 pt-2 border-t border-border/20">
                  {/* Slider */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground block mb-3" style={{ fontWeight: 600 }}>
                      Adjust Time Range
                    </label>
                    <div className="px-1">
                      <Slider
                        value={sliderValues}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={1440}
                        step={15}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Time markers */}
                    <div className="flex justify-between text-xs text-muted-foreground mt-2" style={{ fontWeight: 500 }}>
                      <span>{formatTime(startTime)}</span>
                      <span>{formatTime(endTime)}</span>
                    </div>
                  </div>

                  {/* Quick Adjust Buttons */}


                  {/* Save Button */}
                  <motion.button
                    onClick={handleSaveTime}
                    className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)',
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Check className="w-5 h-5" strokeWidth={2} />
                    <span style={{ fontWeight: 600 }}>Save Changes</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 3️⃣ Description Block */}
        <motion.div
          className={`rounded-2xl ${borderOpacity} overflow-hidden ${isLightTheme ? 'shadow-sm' : 'shadow-lg'}`}
          style={{
            background: sectionGradient,
            backdropFilter: isLightTheme ? 'blur(20px)' : 'blur(40px)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="p-5">
            <label className="text-xs text-muted-foreground block mb-3" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
              DESCRIPTION
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`min-h-[100px] ${textareaBg} ${borderOpacity} resize-none focus:border-primary/60 ${isLightTheme ? 'shadow-sm' : 'shadow-md'}`}
              placeholder="Add notes about this task..."
              style={{ fontWeight: 400 }}
            />
          </div>
        </motion.div>

        {/* Billable Info (if applicable) */}
        {selectedEntry.billable && selectedEntry.rate && selectedEntry.rate > 0 && (
          <motion.div
            className={`rounded-2xl border ${isLightTheme ? 'border-primary/20' : 'border-primary/50'} overflow-hidden ${isLightTheme ? 'shadow-sm' : 'shadow-lg'}`}
            style={{
              background: billableGradient,
              backdropFilter: isLightTheme ? 'blur(20px)' : 'blur(40px)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                  BILLABLE
                </span>
                <Badge
                  className="text-xs px-2 py-0.5"
                  style={isLightTheme ? {
                    backgroundColor: 'rgba(0, 208, 159, 0.15)',
                    color: '#006B54',
                    fontWeight: 600,
                    border: '1px solid rgba(0, 208, 159, 0.35)',
                  } : {
                    backgroundColor: 'rgba(0, 208, 159, 0.2)',
                    color: '#00D68F',
                    fontWeight: 600,
                    border: '1px solid rgba(0, 208, 159, 0.4)',
                  }}
                >
                  ₹{selectedEntry.rate}/hr
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                  Estimated Amount
                </span>
                <span className="text-xl" style={isLightTheme ? { 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3443D9 0%, #008C7A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                } : { 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  ₹{((selectedEntry.rate * duration) / 60).toLocaleString('en-IN', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom spacing for nav */}
        <div className="h-24" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Past Entries Sheet */}
      <Sheet open={showPastEntries} onOpenChange={setShowPastEntries}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-hidden" showClose={false}>
          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 mb-0">
                  <History className="w-5 h-5 text-primary" strokeWidth={2} />
                  <span style={{ fontWeight: 700 }}>Activity History</span>
                </SheetTitle>
                <motion.button
                  onClick={() => setShowPastEntries(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              </div>
              <SheetDescription className="text-left mt-2" style={{ fontWeight: 500 }}>
                {activityName}
              </SheetDescription>
            </SheetHeader>
            
            {/* Summary Stats */}
            <div className="px-6 py-4 border-b border-border/20">
              <div className="space-y-3">
                {/* First Row: Time Taken and Total Billed */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Time Taken */}
                  <motion.div 
                    className="p-4 rounded-xl border border-border/40"
                    style={{
                      background: isLightTheme
                        ? 'linear-gradient(135deg, rgba(75, 92, 251, 0.15) 0%, rgba(0, 199, 183, 0.12) 100%)'
                        : 'linear-gradient(135deg, rgba(75, 92, 251, 0.12) 0%, rgba(0, 199, 183, 0.10) 100%)',
                      backdropFilter: 'blur(20px)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                      <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
                        TIME TAKEN
                      </span>
                    </div>
                    <p className="text-xl" style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {formatDuration(totalMinutesSpent)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                      {pastEntries.length + 1} {pastEntries.length === 0 ? 'entry' : 'entries'}
                    </p>
                  </motion.div>
                  
                  {/* Total Billed Amount (if billable) */}
                  {selectedEntry.billable && selectedEntry.rate && selectedEntry.rate > 0 ? (
                    <motion.div 
                      className="p-4 rounded-xl border border-border/40"
                      style={{
                        background: isLightTheme
                          ? 'linear-gradient(135deg, rgba(0, 208, 159, 0.15) 0%, rgba(75, 92, 251, 0.12) 100%)'
                          : 'linear-gradient(135deg, rgba(0, 208, 159, 0.12) 0%, rgba(75, 92, 251, 0.10) 100%)',
                        backdropFilter: 'blur(20px)',
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
                        <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
                          TOTAL BILLED
                        </span>
                      </div>
                      <p className="text-xl" style={{ 
                        fontWeight: 700,
                        color: '#00D68F',
                      }}>
                        ₹{((selectedEntry.rate * totalMinutesSpent) / 60).toLocaleString('en-IN', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                        @ ₹{selectedEntry.rate}/hr
                      </p>
                    </motion.div>
                  ) : (
                    /* Average TAT (if not billable) */
                    pastEntries.length > 0 && (
                      <motion.div 
                        className="p-4 rounded-xl border border-border/40"
                        style={{
                          background: isLightTheme
                            ? 'linear-gradient(135deg, rgba(0, 199, 183, 0.15) 0%, rgba(75, 92, 251, 0.12) 100%)'
                            : 'linear-gradient(135deg, rgba(0, 199, 183, 0.12) 0%, rgba(75, 92, 251, 0.10) 100%)',
                          backdropFilter: 'blur(20px)',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                          <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
                            AVG/ENTRY
                          </span>
                        </div>
                        <p className="text-xl" style={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {formatDuration(Math.round(totalMinutesSpent / (pastEntries.length + 1)))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                          per session
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
                
                {/* Second Row: Remaining TAT (Full Width) - Only for work orders */}
                {workOrder && budgetEstimate > 0 && (
                  <motion.div 
                    className="p-4 rounded-xl border border-border/40"
                    style={{
                      background: isLightTheme
                        ? 'linear-gradient(135deg, rgba(240, 187, 0, 0.15) 0%, rgba(75, 92, 251, 0.12) 100%)'
                        : 'linear-gradient(135deg, rgba(240, 187, 0, 0.12) 0%, rgba(75, 92, 251, 0.10) 100%)',
                      backdropFilter: 'blur(20px)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                          <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
                            REMAINING TAT
                          </span>
                        </div>
                        <p className="text-2xl mt-1" style={{ 
                          fontWeight: 700,
                          color: budgetUtilization > 100 ? '#FF6B6B' : budgetUtilization > 90 ? '#F0BB00' : '#00C7B7',
                        }}>
                          {(() => {
                            const estimateMinutes = budgetEstimate * 60;
                            const remaining = estimateMinutes - totalMinutesSpent;
                            return remaining > 0 ? formatDuration(remaining) : '0m';
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                          of {budgetEstimate}h estimate • {Math.round(budgetUtilization)}% utilized
                        </p>
                      </div>
                      
                      {workOrder.dueDate && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
                            DUE DATE
                          </p>
                          <p className="text-sm" style={{ fontWeight: 700 }}>
                            {new Date(workOrder.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                            {(() => {
                              const today = new Date();
                              const due = new Date(workOrder.dueDate);
                              const diffTime = due.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
                              if (diffDays === 0) return 'Due today';
                              if (diffDays === 1) return 'Due tomorrow';
                              return `${diffDays} days left`;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Past Entries List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {pastEntries.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                    No previous entries found
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1" style={{ fontWeight: 400 }}>
                    This is your first entry for this activity
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                    PREVIOUS ENTRIES ({pastEntries.length})
                  </p>
                  {pastEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      className={`p-4 rounded-xl transition-all ${
                        isLightTheme
                          ? 'bg-white/90 border-2 border-black/15 shadow-md'
                          : 'border border-border/40'
                      }`}
                      style={{
                        background: isLightTheme
                          ? undefined
                          : 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: isLightTheme ? 'none' : 'blur(20px)',
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                            {formatDate(entry.date)}
                          </p>
                          {entry.isCollaborative && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ 
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              borderColor: 'rgba(139, 92, 246, 0.3)',
                              color: '#8B5CF6'
                            }}>
                              Sub WO
                            </Badge>
                          )}
                        </div>
                        
                        {entry.isCollaborative && entry.loggedByName && (
                          <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                            By: {entry.loggedByName}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm flex-1" style={{ fontWeight: 600 }}>
                            {entry.description || 'No description'}
                          </p>
                          <p className="text-sm" style={{ 
                            fontWeight: 700,
                            color: '#4B5CFB',
                          }}>
                            {formatDuration(entry.durationMinutes || 0)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/20">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" strokeWidth={2} />
                            <span style={{ fontWeight: 500 }}>
                              {entry.startTime && entry.endTime 
                                ? `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`
                                : 'No time data'
                              }
                            </span>
                          </div>
                          
                          {entry.billable && entry.rate && entry.rate > 0 && (
                            <p className="text-xs" style={{ 
                              fontWeight: 700,
                              color: '#00D68F',
                            }}>
                              ₹{entry.rate}/hr
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Deliverable Upload Sheet */}
      <Sheet open={showDeliverableUpload} onOpenChange={setShowDeliverableUpload}>
        <SheetContent side="bottom" className="h-[85vh] p-0 overflow-hidden" showClose={false}>
          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 mb-0">
                  <Target className="w-5 h-5 text-accent" strokeWidth={2} />
                  <span style={{ fontWeight: 700 }}>Submit Deliverables</span>
                </SheetTitle>
                <motion.button
                  onClick={() => setShowDeliverableUpload(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              </div>
              <SheetDescription className="text-left mt-2" style={{ fontWeight: 500 }}>
                Upload files and documentation for review
              </SheetDescription>
            </SheetHeader>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Work Order Info */}
              <motion.div 
                className={`p-4 rounded-xl border ${borderOpacity} zen-shadow-md`}
                style={{
                  background: isLightTheme
                    ? 'linear-gradient(135deg, rgba(240, 187, 0, 0.06) 0%, rgba(75, 92, 251, 0.04) 100%)'
                    : 'linear-gradient(135deg, rgba(240, 187, 0, 0.12) 0%, rgba(75, 92, 251, 0.08) 100%)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                      WORK ORDER
                    </p>
                    <p className="text-sm" style={{ fontWeight: 700 }}>
                      {activityName}
                    </p>
                  </div>
                  <Badge
                    className="text-xs px-2 py-0.5"
                    style={isLightTheme ? {
                      backgroundColor: 'rgba(240, 187, 0, 0.15)',
                      color: '#C89500',
                      fontWeight: 600,
                      border: '1px solid rgba(240, 187, 0, 0.35)',
                    } : {
                      backgroundColor: 'rgba(240, 187, 0, 0.2)',
                      color: '#F0BB00',
                      fontWeight: 600,
                      border: '1px solid rgba(240, 187, 0, 0.4)',
                    }}
                  >
                    {formatDuration(duration)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  {selectedEntry.description || 'No description'}
                </p>
              </motion.div>
              
              {/* File Upload Area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <label className="block mb-2">
                  <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                    ATTACHMENTS
                  </span>
                </label>
                <motion.label
                  className={`block w-full p-8 rounded-xl border-2 border-dashed ${borderOpacity} ${buttonBg} cursor-pointer transition-all`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setUploadedFiles(Array.from(e.target.files));
                        toast.success('Files selected', {
                          description: `${e.target.files.length} file${e.target.files.length > 1 ? 's' : ''} ready to upload`,
                          duration: 2000,
                        });
                      }
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif,.mp4,.mov"
                  />
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Upload className="w-6 h-6 text-accent" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ fontWeight: 600 }}>
                        Tap to select files
                      </p>
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                        PDF, DOC, XLS, PPT, Images, Videos, ZIP
                      </p>
                    </div>
                  </div>
                </motion.label>
                
                {/* Selected Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl ${inputBg} border ${borderOpacity} zen-shadow-md`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4 text-destructive" strokeWidth={2} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
              
              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <label className="block mb-2">
                  <span className="text-xs text-muted-foreground" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                    NOTES (OPTIONAL)
                  </span>
                </label>
                <Textarea
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  placeholder="Add notes about the deliverables..."
                  className={`min-h-[100px] ${textareaBg} border ${borderOpacity} resize-none`}
                  style={{ fontWeight: 500 }}
                />
              </motion.div>
              
              {/* Info Box */}
              <motion.div
                className={`p-4 rounded-xl ${inputBg} border ${borderOpacity} flex items-start gap-3 zen-shadow-md`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                    Your deliverables will be submitted for review. Time logged will be approved once deliverables are reviewed.
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-border/30">
              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setShowDeliverableUpload(false);
                    setUploadedFiles([]);
                    setDeliverableNotes('');
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl border ${borderOpacity} ${buttonBg} ${buttonBgHover} text-sm transition-all`}
                  style={{ fontWeight: 600 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (uploadedFiles.length === 0) {
                      toast.error('No files selected', {
                        description: 'Please attach at least one file',
                        duration: 2000,
                      });
                      return;
                    }
                    
                    // Update entry with deliverables
                    const updatedEntry = {
                      ...selectedEntry,
                      deliverables: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
                      deliverableNotes: deliverableNotes,
                      deliverableSubmittedAt: new Date().toISOString(),
                    };
                    
                    setRecentEntries(
                      recentEntries.map(entry => 
                        entry.id === selectedEntry.id ? updatedEntry : entry
                      )
                    );
                    setSelectedEntry(updatedEntry);
                    
                    setShowDeliverableUpload(false);
                    setUploadedFiles([]);
                    setDeliverableNotes('');
                    
                    toast.success('Deliverables submitted', {
                      description: `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} submitted for review`,
                      duration: 3000,
                    });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: isLightTheme
                      ? 'linear-gradient(135deg, #3443D9 0%, #008C7A 100%)'
                      : 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploadedFiles.length === 0}
                >
                  Submit Deliverables
                </motion.button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};