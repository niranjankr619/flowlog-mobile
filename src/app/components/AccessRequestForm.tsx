import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, AlertCircle, Send, FileText, Info } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { toast } from 'sonner@2.0.3';
import { soundManager } from '../lib/sounds';
import { Checkbox } from './ui/checkbox';

export const AccessRequestForm = () => {
  const { 
    setCurrentScreen, 
    currentUser, 
    selectedWorkOrderForRequest,
    accessRequests,
    setAccessRequests,
  } = useApp();

  // Form state
  const [accessDate, setAccessDate] = useState('');
  const [durationHours, setDurationHours] = useState('2');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purpose, setPurpose] = useState<'deliverable' | 'meeting'>('deliverable'); // New: Purpose selection
  
  // Timeline checkbox state
  const [includeTimeline, setIncludeTimeline] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  // Get today's date for validation (Nov 12, 2025)
  const today = new Date('2025-11-12');
  const maxDate = new Date('2025-11-19'); // 7 days from today
  
  // Format date for input min/max
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && 
    (document.documentElement.classList.contains('dark') || 
     document.documentElement.getAttribute('data-theme') === 'dark');

  const handleSubmit = () => {
    // Validation
    if (!accessDate) {
      toast.error('Please select an access date');
      soundManager.alert();
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for access');
      soundManager.alert();
      return;
    }

    const duration = parseInt(durationHours);
    if (isNaN(duration) || duration < 1 || duration > 8) {
      toast.error('Duration must be between 1-8 hours');
      soundManager.alert();
      return;
    }

    // Create new request
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newRequest = {
        id: `req-${Date.now()}`,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterRole: currentUser.role,
        workOrderId: selectedWorkOrderForRequest.id,
        workOrderName: selectedWorkOrderForRequest.name,
        ownerId: selectedWorkOrderForRequest.owner,
        ownerName: selectedWorkOrderForRequest.ownerName,
        requestedDate: formatDate(today),
        accessDate: accessDate,
        startTime: includeTimeline ? startTime : null,
        endTime: includeTimeline ? endTime : null,
        durationMinutes: duration * 60,
        reason: reason.trim(),
        purpose: purpose, // Add purpose field
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        approvedAt: null,
        deniedAt: null,
        denialReason: null,
      };

      setAccessRequests([newRequest, ...accessRequests]);
      
      soundManager.success();
      toast.success('Access request submitted!', {
        description: `Sent to ${selectedWorkOrderForRequest.ownerName}`,
        duration: 3000,
      });

      setIsSubmitting(false);
      setCurrentScreen('timer');
    }, 800);
  };

  if (!selectedWorkOrderForRequest) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/30">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('work-order-selector')}
              className="p-2 hover:bg-muted rounded-lg transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <div>
                <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Request Access
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                  {selectedWorkOrderForRequest.number}
                </p>
              </div>
              {/* Info Icon with Tooltip */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="p-1.5 rounded-lg hover:bg-muted/50 transition-all"
                  aria-label="Info"
                >
                  <Info className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                </button>
                
                {/* Tooltip */}
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute left-0 top-full mt-2 px-3 py-2 rounded-lg border whitespace-nowrap z-50 shadow-lg ${
                      isDarkMode 
                        ? 'bg-secondary/20 border-secondary/30 backdrop-blur-xl' 
                        : 'bg-secondary/10 border-secondary/20 backdrop-blur-xl'
                    }`}
                  >
                    <p className="text-xs text-secondary" style={{ fontWeight: 500 }}>
                      Max 7 days advance • Duration enforced • Owner approval required
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32 safe-bottom">
        <div className="px-4 pt-6 max-w-md mx-auto space-y-6">
          
          {/* Work Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-card border-2 border-border/40 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1" style={{ fontWeight: 700 }}>
                  {selectedWorkOrderForRequest.name}
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  Owner: {selectedWorkOrderForRequest.ownerName}
                </p>
                <p className="text-xs text-muted-foreground mt-1" style={{ fontWeight: 500 }}>
                  {selectedWorkOrderForRequest.client}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            
            {/* Access Date */}
            <div>
              <label className="flex items-center gap-2 text-xs mb-2 px-1" style={{ fontWeight: 600 }}>
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                Access Date
              </label>
              <input
                type="date"
                value={accessDate}
                onChange={(e) => setAccessDate(e.target.value)}
                min={formatDate(today)}
                max={formatDate(maxDate)}
                className="w-full px-4 py-3 rounded-xl bg-card border-2 border-border/40 focus:border-primary focus:outline-none transition-all"
                style={{ fontWeight: 600 }}
              />
              <p className="text-xs text-muted-foreground mt-1.5 px-1" style={{ fontWeight: 500 }}>
                Date-locked once approved (Max 7 days advance)
              </p>
            </div>

            {/* Purpose Selection - Minimalistic Toggle */}
            <div>
              <label className="flex items-center gap-2 text-xs mb-2 px-1" style={{ fontWeight: 600 }}>
                <FileText className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                Purpose
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPurpose('deliverable')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    purpose === 'deliverable'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border/40 hover:border-border'
                  }`}
                >
                  <p className="text-xs" style={{ fontWeight: 700 }}>
                    Deliverable
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPurpose('meeting')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    purpose === 'meeting'
                      ? 'bg-secondary/10 border-secondary text-secondary'
                      : 'bg-card border-border/40 hover:border-border'
                  }`}
                >
                  <p className="text-xs" style={{ fontWeight: 700 }}>
                    Meeting
                  </p>
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 px-1" style={{ fontWeight: 500 }}>
                {purpose === 'deliverable' 
                  ? '✓ Billable • Reduces TAT from budget' 
                  : '✓ Non-billable • Tracked for context only'}
              </p>
            </div>

            {/* Timeline Checkbox */}
            <div className={`p-4 rounded-xl border-2 transition-all ${
              includeTimeline
                ? isDarkMode ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/20'
                : isDarkMode ? 'bg-muted/20 border-border/40' : 'bg-muted/30 border-border/40'
            }`}>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="timeline-checkbox"
                  checked={includeTimeline}
                  onCheckedChange={(checked) => setIncludeTimeline(!!checked)}
                />
                <label htmlFor="timeline-checkbox" className="flex-1 cursor-pointer">
                  <p className="text-xs" style={{ fontWeight: 700 }}>
                    Include Specific Timeline
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                    {includeTimeline ? 'Specify exact start/end times' : 'Optional - Add precise time window'}
                  </p>
                </label>
              </div>
            </div>

            {/* Timeline Fields - Show when checkbox enabled */}
            {includeTimeline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="flex items-center gap-2 text-xs mb-2 px-1" style={{ fontWeight: 600 }}>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                  Time Window
                </label>
                
                {/* Start and End Time - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Start Time */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 px-1" style={{ fontWeight: 500 }}>
                      Start
                    </p>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-card border-2 border-border/40 focus:border-primary focus:outline-none transition-all"
                      style={{ fontWeight: 600 }}
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 px-1" style={{ fontWeight: 500 }}>
                      End
                    </p>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-card border-2 border-border/40 focus:border-primary focus:outline-none transition-all"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 px-1" style={{ fontWeight: 500 }}>
                  Timeline: {startTime} - {endTime}
                </p>
              </motion.div>
            )}

            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-xs mb-2 px-1" style={{ fontWeight: 600 }}>
                <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                Duration Limit (Hours)
              </label>
              <input
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                min="1"
                max="8"
                step="0.5"
                className="w-full px-4 py-3 rounded-xl bg-card border-2 border-border/40 focus:border-primary focus:outline-none transition-all"
                style={{ fontWeight: 600 }}
                placeholder="e.g., 2"
              />
              <p className="text-xs text-muted-foreground mt-1.5 px-1" style={{ fontWeight: 500 }}>
                Timer will auto-stop at limit (1-8 hours)
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="flex items-center gap-2 text-xs mb-2 px-1" style={{ fontWeight: 600 }}>
                <FileText className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                Reason for Access
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-card border-2 border-border/40 focus:border-primary focus:outline-none transition-all resize-none"
                style={{ fontWeight: 500 }}
                placeholder="Explain why you need access to this work order..."
              />
              <p className="text-xs text-muted-foreground mt-1.5 px-1" style={{ fontWeight: 500 }}>
                {reason.length}/500 characters
              </p>
            </div>

          </motion.div>

        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-20 glass-overlay border-t border-border/30 safe-bottom">
        <div className="px-4 py-4 space-y-2">
          
          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              isSubmitting
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            style={{ fontWeight: 700 }}
            whileHover={!isSubmitting ? { scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.99 } : {}}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                Submit Request
              </>
            )}
          </motion.button>

          {/* Cancel Button */}
          <motion.button
            onClick={() => setCurrentScreen('work-order-selector')}
            className="w-full py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive/30 hover:border-destructive/50 shadow-sm transition-all text-destructive flex items-center justify-center"
            style={{ fontWeight: 600 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Cancel
          </motion.button>

        </div>
      </div>

    </div>
  );
};