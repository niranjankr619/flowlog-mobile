import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, AlertCircle, Send, FileText, Zap, Users, User } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { toast } from 'sonner@2.0.3';
import { soundManager } from '../lib/sounds';
import { users } from '../lib/mockData';
import { BottomNav } from './BottomNav';

export const OwnerAssignSubWorkOrder = () => {
  const { 
    setCurrentScreen, 
    currentUser, 
    selectedWorkOrderForAssignment,
    subWorkOrders,
    setSubWorkOrders,
  } = useApp();

  // Form state
  const [allocatedHours, setAllocatedHours] = useState('');
  const [subWorkOrderName, setSubWorkOrderName] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [assignToUserId, setAssignToUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get today's date (Nov 17, 2025)
  const today = new Date('2025-11-17');
  
  // Format date for input min/max
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get parent work order date constraints
  const parentStartDate = selectedWorkOrderForAssignment ? new Date(selectedWorkOrderForAssignment.startDate) : today;
  const parentDueDate = selectedWorkOrderForAssignment ? new Date(selectedWorkOrderForAssignment.dueDate) : new Date('2025-12-31');
  
  // Calculate available start date (max of today and parent start date)
  const availableStartDate = today > parentStartDate ? today : parentStartDate;

  // Get list of users to assign to (exclude current user)
  const assignableUsers = Object.values(users).filter((u: any) => u.id !== currentUser.id);
  const selectedUser = assignableUsers.find((u: any) => u.id === assignToUserId);

  const handleSubmit = () => {
    // Validation
    if (!assignToUserId) {
      toast.error('Please select a team member to assign to');
      return;
    }

    if (!subWorkOrderName.trim()) {
      toast.error('Please enter a sub work order name');
      return;
    }

    if (!allocatedHours || parseFloat(allocatedHours) <= 0) {
      toast.error('Please enter allocated hours');
      return;
    }

    if (!deliverables.trim()) {
      toast.error('Please describe the deliverables');
      return;
    }

    if (deliverables.trim().length < 20) {
      toast.error('Deliverables description must be at least 20 characters');
      return;
    }

    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    // Validate date range
    const start = new Date(startDate);
    const due = new Date(dueDate);
    
    if (due <= start) {
      toast.error('Due date must be after start date');
      return;
    }

    // Validate within parent work order timeline
    if (start < parentStartDate) {
      toast.error(`Start date cannot be before parent work order start date (${formatDateForInput(parentStartDate)})`);
      return;
    }

    if (due > parentDueDate) {
      toast.error(`Due date cannot be after parent work order due date (${formatDateForInput(parentDueDate)})`);
      return;
    }

    // Validate TAT availability
    const allocatedHrs = parseFloat(allocatedHours);
    const parentTAT = selectedWorkOrderForAssignment?.estimatedHours || 0;
    const parentUsed = selectedWorkOrderForAssignment?.actualHours || 0;
    
    // Calculate already allocated hours
    const alreadyAllocated = subWorkOrders
      .filter(swo => 
        swo.parentWorkOrderId === selectedWorkOrderForAssignment?.number && 
        (swo.status === 'active' || swo.status === 'pending-approval' || swo.status === 'pending')
      )
      .reduce((sum, swo) => sum + ((swo.allocatedMinutes || swo.requestedHours * 60 || 0) / 60), 0);
    
    const availableTAT = parentTAT - parentUsed - alreadyAllocated;
    
    if (allocatedHrs > availableTAT) {
      toast.error(`Allocated hours (${allocatedHrs}h) exceeds available TAT (${availableTAT.toFixed(1)}h)`);
      return;
    }

    setIsSubmitting(true);

    // Create new sub work order (requires acknowledgment from assignee)
    const newSubWorkOrder = {
      id: `subwo-${Date.now()}`,
      parentWorkOrderId: selectedWorkOrderForAssignment?.number || '',
      parentWorkOrderName: selectedWorkOrderForAssignment?.name || '',
      parentWorkOrderTAT: parentTAT,
      subWorkOrderNumber: `${selectedWorkOrderForAssignment?.number}-SUB-${String(subWorkOrders.length + 1).padStart(3, '0')}`,
      subWorkOrderName: subWorkOrderName.trim(),
      assignedToId: assignToUserId,
      assignedToName: selectedUser?.name || '',
      assignedToRole: selectedUser?.role || '',
      assignedById: currentUser.id,
      assignedByName: currentUser.name,
      allocatedHours: allocatedHrs,
      allocatedMinutes: allocatedHrs * 60,
      usedMinutes: 0,
      remainingMinutes: allocatedHrs * 60,
      status: 'pending-acknowledgment' as const,
      deliverables: deliverables.trim(),
      startDate: startDate,
      dueDate: dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
      type: 'owner-initiated' as const,
    };

    // Simulate submission
    setTimeout(() => {
      setSubWorkOrders([...subWorkOrders, newSubWorkOrder]);
      soundManager.success();
      toast.success('Sub Work Order assigned!', {
        description: `${allocatedHrs}h allocated to ${selectedUser?.name} - awaiting acknowledgment`
      });
      
      setIsSubmitting(false);
      setCurrentScreen('dashboard');
    }, 800);
  };

  if (!selectedWorkOrderForAssignment) {
    return null;
  }

  // Calculate remaining TAT
  const parentTAT = selectedWorkOrderForAssignment.estimatedHours || 0;
  const parentUsed = selectedWorkOrderForAssignment.actualHours || 0;
  
  // Calculate already allocated hours
  const alreadyAllocated = subWorkOrders
    .filter(swo => 
      swo.parentWorkOrderId === selectedWorkOrderForAssignment.number && 
      (swo.status === 'active' || swo.status === 'pending-approval' || swo.status === 'pending')
    )
    .reduce((sum, swo) => sum + ((swo.allocatedMinutes || swo.requestedHours * 60 || 0) / 60), 0);
  
  const allocatedHrs = parseFloat(allocatedHours) || 0;
  const availableTAT = parentTAT - parentUsed - alreadyAllocated;
  const ownerRemaining = availableTAT - allocatedHrs;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/30">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center justify-between mb-3">
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
                  Assign Sub Work Order
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontWeight: 500 }}>
                  Delegate work from your TAT allocation
                </p>
              </div>
            </div>
            <Users className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>

          {/* Work Order Context */}
          <div className="p-3 rounded-xl glass-card border border-border/30">
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ 
                  background: selectedWorkOrderForAssignment.type === 'sequence' 
                    ? 'linear-gradient(135deg, rgba(0, 199, 183, 0.2) 0%, rgba(0, 199, 183, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(75, 92, 251, 0.2) 0%, rgba(75, 92, 251, 0.05) 100%)'
                }}
              >
                <FileText 
                  className="w-5 h-5" 
                  style={{ color: selectedWorkOrderForAssignment.type === 'sequence' ? '#00C7B7' : '#4B5CFB' }} 
                  strokeWidth={2} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                  {selectedWorkOrderForAssignment.number}
                </p>
                <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                  {selectedWorkOrderForAssignment.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs" style={{ 
                    color: selectedWorkOrderForAssignment.type === 'sequence' ? '#00C7B7' : '#4B5CFB',
                    fontWeight: 600 
                  }}>
                    Your WO (Owner)
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                    Available: {availableTAT.toFixed(1)} hrs
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span style={{ fontWeight: 500 }}>
                    {formatDateForInput(parentStartDate)} - {formatDateForInput(parentDueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 safe-bottom">
        <div className="max-w-md mx-auto space-y-6">

          {/* Assign To User */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
              ASSIGN TO *
            </label>
            <select
              value={assignToUserId}
              onChange={(e) => setAssignToUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-card border border-border/30 text-sm"
              style={{ fontWeight: 500 }}
            >
              <option value="">Select team member...</option>
              {assignableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role}
                </option>
              ))}
            </select>
            {selectedUser && (
              <div className="mt-2 p-2.5 rounded-lg bg-muted/30 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" strokeWidth={2} />
                <p className="text-xs" style={{ fontWeight: 600 }}>
                  <span className="text-muted-foreground">Assigning to: </span>
                  <span className="text-primary">{selectedUser.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Sub Work Order Name */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
              SUB WORK ORDER NAME *
            </label>
            <input
              type="text"
              value={subWorkOrderName}
              onChange={(e) => setSubWorkOrderName(e.target.value)}
              placeholder="e.g., Mobile UI Testing Sprint 1"
              className="w-full px-4 py-3 rounded-xl glass-card border border-border/30 text-sm"
              style={{ fontWeight: 500 }}
            />
          </div>

          {/* Allocated Hours */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
              ALLOCATED HOURS *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                step="0.5"
                max={availableTAT}
                value={allocatedHours}
                onChange={(e) => setAllocatedHours(e.target.value)}
                placeholder={`Max: ${availableTAT.toFixed(1)} hrs`}
                className="w-full px-4 py-3 rounded-xl glass-card border border-border/30 text-sm"
                style={{ fontWeight: 500 }}
              />
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
            </div>
            {allocatedHrs > 0 && (
              <div className={`mt-2 p-2.5 rounded-lg ${ownerRemaining < 0 ? 'bg-destructive/10' : 'bg-muted/30'}`}>
                <p className="text-xs" style={{ fontWeight: 600 }}>
                  <span className="text-muted-foreground">You will have: </span>
                  <span style={{ color: ownerRemaining >= 0 ? '#00C7B7' : '#FF4D4D' }}>
                    {ownerRemaining.toFixed(1)} hrs remaining
                  </span>
                </p>
              </div>
            )}
            {allocatedHrs > availableTAT && (
              <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-destructive" style={{ fontWeight: 600 }}>
                  Exceeds available TAT ({availableTAT.toFixed(1)} hrs)
                </p>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
                START DATE *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={formatDateForInput(availableStartDate)}
                max={formatDateForInput(parentDueDate)}
                className="w-full px-4 py-3 rounded-xl glass-card border border-border/30 text-sm"
                style={{ fontWeight: 500 }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
                DUE DATE *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={startDate || formatDateForInput(availableStartDate)}
                max={formatDateForInput(parentDueDate)}
                className="w-full px-4 py-3 rounded-xl glass-card border border-border/30 text-sm"
                style={{ fontWeight: 500 }}
              />
            </div>
          </div>
          
          {/* Timeline validation hint */}
          {(startDate || dueDate) && (
            <div className="p-2.5 rounded-lg bg-muted/30 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                Must be within parent WO timeline: {formatDateForInput(availableStartDate)} to {formatDateForInput(parentDueDate)}
              </p>
            </div>
          )}

          {/* Deliverables */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
              DELIVERABLES * (min 20 characters)
            </label>
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="Describe what the assignee should deliver (e.g., Test reports, bug documentation, QA sign-off)"
              rows={4}
              className="w-full px-4 py-3 rounded-xl glass-card border border-border/30 text-sm resize-none"
              style={{ fontWeight: 500 }}
            />
            <p className="text-xs text-muted-foreground mt-1" style={{ fontWeight: 500 }}>
              {deliverables.length} / 20 characters
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-4 glass-overlay border-t border-border/30 safe-bottom">
        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm relative overflow-hidden"
          style={{
            background: isSubmitting 
              ? 'rgba(75, 92, 251, 0.5)'
              : 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            opacity: isSubmitting ? 0.7 : 1,
          }}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Assigning...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" strokeWidth={2} />
              <span>Assign Sub Work Order</span>
            </>
          )}
        </motion.button>
      </div>
      <BottomNav />
    </div>
  );
};