import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight,
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  Users,
  Briefcase,
  AlertCircle,
  Send,
  CheckCheck,
  Edit3,
  Paperclip,
  FileText,
  Download,
  Search,
  Filter,
  RotateCcw,
  History,
  Zap,
  X,
  Package,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { toast } from 'sonner@2.0.3';
import { soundManager } from '../lib/sounds';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BottomNav } from './BottomNav';

type TabType = 'for-approval' | 'my-requests' | 'history';

export const NotificationCenter = () => {
  const { 
    setCurrentScreen, 
    currentUser,
    subWorkOrders,
    setSubWorkOrders,
    recentEntries,
    setRecentEntries,
    setSelectedEntry,
    theme,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('for-approval');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [celebrationType, setCelebrationType] = useState<'approved' | 'rejected' | null>(null);
  
  // Adjustment states for access requests
  const [adjustingRequestId, setAdjustingRequestId] = useState<string | null>(null);
  const [adjustedDurations, setAdjustedDurations] = useState<Record<string, number>>({});

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'access-request' | 'deliverable'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter based on current user - Sub Work Orders
  const receivedSubWORequests = subWorkOrders.filter(swo => swo.assignedById === currentUser.id && swo.status === 'pending');
  const sentSubWORequests = subWorkOrders.filter(swo => swo.assignedToId === currentUser.id && swo.status === 'pending');
  const receivedDeliverables = subWorkOrders.filter(swo => swo.assignedById === currentUser.id && swo.status === 'pending-approval');
  const sentDeliverables = subWorkOrders.filter(swo => swo.assignedToId === currentUser.id && swo.status === 'pending-approval');
  const assignmentsToMe = subWorkOrders.filter(swo => swo.assignedToId === currentUser.id && swo.status === 'pending-acknowledgment');

  // Apply search filter only (status is already filtered to pending)
  const filterItems = <T extends { 
    status: string; 
    requesterName?: string; 
    submitterName?: string; 
    ownerName?: string; 
    assignedByName?: string;
    assignedToName?: string;
    workOrderName?: string; 
    workOrderId?: string; 
    subWorkOrderName?: string;
    parentWorkOrderId?: string;
    reason?: string; 
    notes?: string;
    deliverables?: string;
  }>(items: T[]): T[] => {
    return items.filter(item => {
      // Search filter
      const searchMatch = searchQuery === '' ||
        item.requesterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submitterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workOrderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subWorkOrderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parentWorkOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deliverables?.toLowerCase().includes(searchQuery.toLowerCase());

      return searchMatch;
    });
  };

  // Filtered lists - using Sub Work Orders
  const filteredReceivedSubWORequests = typeFilter === 'deliverable' ? [] : receivedSubWORequests;
  const filteredSentSubWORequests = typeFilter === 'deliverable' ? [] : sentSubWORequests;
  const filteredReceivedDeliverables = typeFilter === 'access-request' ? [] : receivedDeliverables;
  const filteredSentDeliverables = typeFilter === 'access-request' ? [] : sentDeliverables;

  // Count pending items for approval
  const pendingSubWOCount = receivedSubWORequests.length;
  const pendingDeliverablesCount = receivedDeliverables.length;
  const totalPendingCount = pendingSubWOCount + pendingDeliverablesCount;

  // Count active filters
  const activeFiltersCount = (typeFilter !== 'all' ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
  };

  // Check if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Access Request Handlers
  const handleApproveAccess = (requestId: string) => {
    setProcessingId(requestId);
    soundManager.success();

    // Show celebration animation
    setTimeout(() => {
      setProcessingId(null);
      setCelebratingId(requestId);
      setCelebrationType('approved');
    }, 300);

    // After celebration, update status
    setTimeout(() => {
      const request = subWorkOrders.find(r => r.id === requestId);
      const approvedDuration = adjustedDurations[requestId] || request?.allocatedHours || 0;
      
      // Update the sub work order request
      setSubWorkOrders(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'approved' as const,
              approvedAt: new Date().toISOString(),
              allocatedHours: approvedDuration,
              allocatedMinutes: approvedDuration * 60,
              remainingMinutes: approvedDuration * 60,
              subWorkOrderNumber: req.subWorkOrderNumber || `${req.parentWorkOrderId}-SUB-${Date.now().toString().slice(-3)}`,
            }
          : req
      ));

      toast.success('Sub Work Order Approved!', {
        description: `${request?.assignedToName || 'User'} can now work on this task`,
        duration: 3000,
      });

      setCelebratingId(null);
      setCelebrationType(null);
      setAdjustingRequestId(null);
    }, 1800); // 300ms processing + 1500ms celebration = 1800ms total
  };

  const handleDenyAccess = (requestId: string) => {
    setProcessingId(requestId);
    soundManager.alert();

    // Show celebration animation
    setTimeout(() => {
      setProcessingId(null);
      setCelebratingId(requestId);
      setCelebrationType('rejected');
    }, 300);

    // After celebration, update status
    setTimeout(() => {
      const request = subWorkOrders.find(r => r.id === requestId);
      
      // Update the sub work order request
      setSubWorkOrders(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'denied' as const,
              deniedAt: new Date().toISOString(),
              denialReason: 'Request denied by work order owner',
            }
          : req
      ));

      toast.error('Sub Work Order Denied', {
        description: `Request from ${request?.assignedToName || 'User'} denied`,
        duration: 3000,
      });

      setCelebratingId(null);
      setCelebrationType(null);
      setAdjustingRequestId(null);
    }, 1800); // 300ms processing + 1500ms celebration = 1800ms total
  };

  // Deliverable Handlers
  const handleApproveDeliverable = (deliverableId: string) => {
    setProcessingId(deliverableId);
    soundManager.success();

    // Show celebration animation
    setTimeout(() => {
      setProcessingId(null);
      setCelebratingId(deliverableId);
      setCelebrationType('approved');
    }, 300);

    // After celebration, update status
    setTimeout(() => {
      const submission = subWorkOrders.find(s => s.id === deliverableId);
      
      setSubWorkOrders(prev => prev.map(sub => 
        sub.id === deliverableId 
          ? { 
              ...sub, 
              status: 'completed' as const,
              approvedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
            }
          : sub
      ));

      toast.success('Deliverable Approved!', {
        description: `${submission?.assignedToName || 'User'}'s work has been approved`,
        duration: 3000,
      });

      setCelebratingId(null);
      setCelebrationType(null);
    }, 1800); // 300ms processing + 1500ms celebration = 1800ms total
  };

  const handleRejectDeliverable = (deliverableId: string) => {
    setProcessingId(deliverableId);
    soundManager.alert();

    // Show celebration animation
    setTimeout(() => {
      setProcessingId(null);
      setCelebratingId(deliverableId);
      setCelebrationType('rejected');
    }, 300);

    // After celebration, update status
    setTimeout(() => {
      const submission = subWorkOrders.find(s => s.id === deliverableId);
      
      setSubWorkOrders(prev => prev.map(sub => 
        sub.id === deliverableId 
          ? { 
              ...sub, 
              status: 'active' as const, // Return to active for revision
              rejectedAt: new Date().toISOString(),
              rejectionReason: 'Deliverables need revision',
              deliverableNotes: undefined, // Clear previous submission
              deliverableAttachments: undefined,
              deliverableSubmittedAt: undefined,
            }
          : sub
      ));

      toast.error('Deliverable Rejected', {
        description: `Submission from ${submission?.assignedToName || 'User'} needs revision`,
        duration: 3000,
      });

      setCelebratingId(null);
      setCelebrationType(null);
    }, 1800); // 300ms processing + 1500ms celebration = 1800ms total
  };

  // Assignment Acknowledgment Handlers
  const handleAcknowledgeAssignment = (assignmentId: string) => {
    setProcessingId(assignmentId);
    soundManager.success();

    // Show celebration animation
    setTimeout(() => {
      setProcessingId(null);
      setCelebratingId(assignmentId);
      setCelebrationType('approved');
    }, 300);

    // After celebration, update status to active
    setTimeout(() => {
      const assignment = subWorkOrders.find(r => r.id === assignmentId);
      
      setSubWorkOrders(prev => prev.map(req => 
        req.id === assignmentId 
          ? { 
              ...req, 
              status: 'active' as const,
              acknowledgedAt: new Date().toISOString(),
            }
          : req
      ));

      toast.success('Sub Work Order Acknowledged!', {
        description: `You can now start working on ${assignment?.subWorkOrderName}`,
        duration: 3000,
      });

      setCelebratingId(null);
      setCelebrationType(null);
    }, 1800);
  };

  const handleDeclineAssignment = (assignmentId: string) => {
    setProcessingId(assignmentId);
    soundManager.alert();

    // Show celebration animation
    setTimeout(() => {
      setProcessingId(null);
      setCelebratingId(assignmentId);
      setCelebrationType('rejected');
    }, 300);

    // After celebration, remove the assignment
    setTimeout(() => {
      const assignment = subWorkOrders.find(r => r.id === assignmentId);
      
      setSubWorkOrders(prev => prev.filter(req => req.id !== assignmentId));

      toast.error('Assignment Declined', {
        description: `${assignment?.assignedByName} will be notified`,
        duration: 3000,
      });

      setCelebratingId(null);
      setCelebrationType(null);
    }, 1800);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date('2025-11-12');
    const yesterday = new Date('2025-11-11');
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent/10 border border-accent/30">
            <Clock className="w-3 h-3 text-accent" strokeWidth={2} />
            <span className="text-xs text-accent" style={{ fontWeight: 600 }}>
              Pending
            </span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/10 border border-secondary/30">
            <CheckCircle2 className="w-3 h-3 text-secondary" strokeWidth={2} />
            <span className="text-xs text-secondary" style={{ fontWeight: 600 }}>
              Approved
            </span>
          </div>
        );
      case 'denied':
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/30">
            <XCircle className="w-3 h-3 text-destructive" strokeWidth={2} />
            <span className="text-xs text-destructive" style={{ fontWeight: 600 }}>
              {status === 'denied' ? 'Denied' : 'Rejected'}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderForApprovalTab = () => {
    const hasAssignments = assignmentsToMe.length > 0;
    const hasAccessRequests = filteredReceivedSubWORequests.length > 0;
    const hasDeliverables = filteredReceivedDeliverables.length > 0;

    if (!hasAssignments && !hasAccessRequests && !hasDeliverables) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-muted/30' : 'bg-muted/50'
          }`}>
            <Bell className="w-7 h-7 text-muted-foreground" strokeWidth={2} />
          </div>
          <p className="text-sm text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
            No items for approval
          </p>
          <p className="text-xs text-muted-foreground text-center" style={{ fontWeight: 500 }}>
            Assignments and requests will appear here
          </p>
        </motion.div>
      );
    }

    // Combine all approval items into one unified array
    type ApprovalItem = {
      id: string;
      type: 'request' | 'assignment' | 'deliverable';
      timestamp: string;
      data: any;
    };

    const allApprovalItems: ApprovalItem[] = [
      ...filteredReceivedSubWORequests.map(req => ({
        id: req.id,
        type: 'request' as const,
        timestamp: req.requestedAt,
        data: req
      })),
      ...assignmentsToMe.map(assign => ({
        id: assign.id,
        type: 'assignment' as const,
        timestamp: assign.assignedAt,
        data: assign
      })),
      ...filteredReceivedDeliverables.map(deliv => ({
        id: deliv.id,
        type: 'deliverable' as const,
        timestamp: deliv.submittedAt,
        data: deliv
      }))
    ];

    // Sort by timestamp (newest first)
    allApprovalItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
      <div className="space-y-3 px-4">
        {/* Quick Link to Surveillance Dashboard */}
        <button
          onClick={() => setCurrentScreen('sub-work-order-surveillance')}
          className="w-full p-3 rounded-xl glass-card hover:border-primary/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="text-sm" style={{ fontWeight: 600 }}>
              Monitor Active Sub Work Orders
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
        </button>

        {/* Unified list - all items together, differentiated by chips */}
        {allApprovalItems.map((item, index) => {
          // Render Sub WO Request
          if (item.type === 'request') {
            const request = item.data;
            return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: celebratingId === request.id ? 0 : 1, 
                    x: 0,
                    scale: celebratingId === request.id ? 0.95 : 1,
                  }}
                  transition={{ 
                    delay: celebratingId === request.id ? 0 : index * 0.05,
                    duration: celebratingId === request.id ? 0.3 : 0.2,
                  }}
                  className={`p-4 rounded-3xl border transition-all relative overflow-hidden ${
                    processingId === request.id
                      ? 'opacity-70 scale-95'
                      : celebratingId === request.id
                      ? celebrationType === 'approved'
                        ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/20'
                        : 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/20'
                      : isDarkMode
                      ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                      : 'bg-card border-primary/40'
                  }`}
                  style={celebratingId !== request.id && !isDarkMode ? {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  } : celebratingId === request.id ? {
                    boxShadow: celebrationType === 'approved' 
                      ? '0 0 30px rgba(0, 199, 183, 0.5), 0 0 60px rgba(0, 199, 183, 0.3)'
                      : '0 0 30px rgba(255, 77, 77, 0.5), 0 0 60px rgba(255, 77, 77, 0.3)',
                  } : {}}
                >
                  {/* Celebration Overlay */}
                  {celebratingId === request.id && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center z-10 rounded-3xl"
                      style={{
                        background: celebrationType === 'approved'
                          ? 'linear-gradient(135deg, rgba(0, 214, 143, 0.95) 0%, rgba(0, 199, 183, 0.95) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 77, 77, 0.95) 0%, rgba(255, 107, 107, 0.95) 100%)',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        >
                          {celebrationType === 'approved' ? (
                            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-2" strokeWidth={2.5} />
                          ) : (
                            <XCircle className="w-16 h-16 text-white mx-auto mb-2" strokeWidth={2.5} />
                          )}
                        </motion.div>
                        <motion.p
                          className="text-white text-lg"
                          style={{ fontWeight: 700 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {celebrationType === 'approved' ? 'Approved!' : 'Denied!'}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Left: Requester Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                        }}
                      >
                        <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                          {request.assignedToName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {request.assignedToName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                          {request.assignedToRole}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right: Request Type Chip */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: 'rgba(75, 92, 251, 0.2)'
                      }}
                    >
                      <Send className="w-3 h-3" strokeWidth={2} style={{ color: '#4B5CFB' }} />
                      <span className="text-xs" style={{ fontWeight: 700, color: '#4B5CFB' }}>
                        Request
                      </span>
                    </div>
                  </div>

                  {/* Sub Work Order Info in Card */}
                  <div className="mb-3 p-4 rounded-2xl border"
                    style={{ 
                      backgroundColor: isDarkMode 
                        ? 'rgba(75, 92, 251, 0.05)' 
                        : 'rgba(75, 92, 251, 0.08)',
                      borderColor: 'rgba(75, 92, 251, 0.1)'
                    }}
                  >
                    {/* Sub Work Order Name */}
                    <p className="text-sm truncate mb-0.5" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {request.subWorkOrderName}
                    </p>
                    
                    {/* Parent Work Order */}
                    <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 500 }}>
                      Parent: {request.parentWorkOrderId} - {request.parentWorkOrderName}
                    </p>
                    
                    {/* Separator */}
                    <div className="h-px w-full bg-border/30 mb-3" />
                    
                    {/* Date & Time - Single Line */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                        <span className="text-sm text-secondary" style={{ fontWeight: 700 }}>
                          {formatDate(request.startDate)} - {formatDate(request.dueDate)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                        <span className="text-sm text-secondary" style={{ fontWeight: 700 }}>
                          {request.requestedHours}h requested
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-3 p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
                      DELIVERABLES:
                    </p>
                    <p className="text-xs text-foreground" style={{ fontWeight: 500, lineHeight: '19.2px' }}>
                      {request.deliverables}
                    </p>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-muted-foreground italic mb-4" style={{ fontWeight: 500, lineHeight: '19.2px' }}>
                    "{request.requestReason}"
                  </p>

                  {/* Actions - Only for pending requests */}
                  {request.status === 'pending' && (
                    <>
                      {adjustingRequestId !== request.id ? (
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleApproveAccess(request.id)}
                            disabled={processingId === request.id}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center ${
                              processingId === request.id
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'text-white'
                            }`}
                            style={processingId === request.id ? { fontWeight: 600 } : { 
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)'
                            }}
                            whileHover={processingId !== request.id ? { scale: 1.01 } : {}}
                            whileTap={processingId !== request.id ? { scale: 0.99 } : {}}
                          >
                            {processingId === request.id ? (
                              <>
                                <motion.div
                                  className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                                Approve
                              </>
                            )}
                          </motion.button>

                          <motion.button
                            onClick={() => {
                              setAdjustingRequestId(request.id);
                              setAdjustedDurations({
                                ...adjustedDurations,
                                [request.id]: request.requestedHours * 60
                              });
                            }}
                            className="py-3 px-4 rounded-xl flex items-center justify-center transition-all text-sm text-center bg-muted/50 hover:bg-muted text-muted-foreground"
                            style={{ fontWeight: 600 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <Edit3 className="w-4 h-4" strokeWidth={2} />
                          </motion.button>

                          <motion.button
                            onClick={() => handleDenyAccess(request.id)}
                            disabled={processingId === request.id}
                            className={`py-3 px-4 rounded-xl flex items-center justify-center transition-all text-sm text-center ${
                              processingId === request.id
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-muted/50 hover:bg-muted text-destructive'
                            }`}
                            style={{ fontWeight: 600 }}
                            whileHover={processingId !== request.id ? { scale: 1.01 } : {}}
                            whileTap={processingId !== request.id ? { scale: 0.99 } : {}}
                          >
                            <XCircle className="w-4 h-4" strokeWidth={2} />
                          </motion.button>
                        </div>
                      ) : (
                        <AnimatePresence>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            {/* Slider */}
                            <div className="border-t border-border/20 pt-3">
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                                  Adjust Duration
                                </label>
                                <span className="text-sm" style={{ fontWeight: 700, color: '#00C7B7' }}>
                                  {((adjustedDurations[request.id] || (request.requestedHours * 60)) / 60).toFixed(1)}h
                                </span>
                              </div>
                              
                              <div className="px-1 mb-3">
                                <Slider
                                  value={[(adjustedDurations[request.id] || (request.requestedHours * 60))]}
                                  onValueChange={(values) => {
                                    setAdjustedDurations({
                                      ...adjustedDurations,
                                      [request.id]: values[0]
                                    });
                                  }}
                                  min={0}
                                  max={(request.requestedHours * 60) * 2}
                                  step={30}
                                  className="w-full"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => {
                                    setAdjustingRequestId(null);
                                    setAdjustedDurations({
                                      ...adjustedDurations,
                                      [request.id]: request.requestedHours * 60
                                    });
                                  }}
                                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center bg-muted/50 hover:bg-muted text-muted-foreground"
                                  style={{ fontWeight: 600 }}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                                  Cancel
                                </motion.button>

                                <motion.button
                                  onClick={() => handleApproveAccess(request.id, adjustedDurations[request.id] / 60)}
                                  disabled={processingId === request.id}
                                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center ${
                                    processingId === request.id
                                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                      : 'text-white'
                                  }`}
                                  style={processingId === request.id ? { fontWeight: 600 } : { 
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)'
                                  }}
                                  whileHover={processingId !== request.id ? { scale: 1.01 } : {}}
                                  whileTap={processingId !== request.id ? { scale: 0.99 } : {}}
                                >
                                  {processingId === request.id ? (
                                    <>
                                      <motion.div
                                        className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                      />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                                      Approve Adjusted
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </>
                  )}

                  {/* Approval/Denial Info */}
                  {request.status === 'approved' && request.approvedAt && (
                    <div className="pt-4 border-t border-border/20 flex items-center gap-2">
                      <CheckCheck className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                      <p className="text-xs text-secondary" style={{ fontWeight: 500 }}>
                        Approved {formatDate(request.approvedAt)}
                      </p>
                    </div>
                  )}

                  {request.status === 'denied' && request.deniedAt && (
                    <div className="pt-4 border-t border-border/20 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                      <p className="text-xs text-destructive" style={{ fontWeight: 500 }}>
                        Denied {formatDate(request.deniedAt)}
                      </p>
                    </div>
                  )}
                </motion.div>
            );
          }
          
          // Render Assignment
          if (item.type === 'assignment') {
            const assignment = item.data;
            return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-3xl border transition-all ${
                    processingId === assignment.id
                      ? 'opacity-70 scale-95'
                      : celebratingId === assignment.id
                      ? celebrationType === 'approved'
                        ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/20'
                        : 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/20'
                      : isDarkMode
                      ? 'bg-card border-accent/30 shadow-lg shadow-accent/5'
                      : 'bg-card border-accent/40'
                  }`}
                  style={celebratingId !== assignment.id && !isDarkMode ? {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  } : {}}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Left: Owner Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                        }}
                      >
                        <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                          {assignment.assignedByName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {assignment.assignedByName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                          Assigned by (Owner)
                        </p>
                      </div>
                    </div>
                    
                    {/* Right: Status Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: 'rgba(240, 187, 0, 0.2)'
                      }}
                    >
                      <AlertCircle className="w-3 h-3" strokeWidth={2} style={{ color: '#FFC043' }} />
                      <span className="text-xs" style={{ fontWeight: 700, color: '#FFC043' }}>
                        Awaiting Ack
                      </span>
                    </div>
                  </div>

                  {/* Sub Work Order Info */}
                  <div className="mb-4 p-3 rounded-2xl"
                    style={{ 
                      background: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.03)' 
                        : 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <p className="mb-1" style={{ fontWeight: 600 }}>
                      {assignment.subWorkOrderName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />
                      <span style={{ fontWeight: 500 }}>{assignment.parentWorkOrderId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                        <span style={{ fontWeight: 600, color: '#4B5CFB' }}>
                          {assignment.allocatedHours}h allocated
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                        <span className="text-muted-foreground" style={{ fontWeight: 500 }}>
                          Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-4 p-3 rounded-2xl border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                        DELIVERABLES
                      </p>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed" style={{ fontWeight: 500 }}>
                      {assignment.deliverables}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleDeclineAssignment(assignment.id)}
                      disabled={processingId === assignment.id || celebratingId === assignment.id}
                      className="flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                      style={{
                        backgroundColor: 'rgba(255, 77, 77, 0.1)',
                        border: '1.5px solid rgba(255, 77, 77, 0.3)',
                      }}
                      whileTap={processingId !== assignment.id ? { scale: 0.95 } : {}}
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} style={{ color: '#FF4D4D' }} />
                      <span className="text-sm" style={{ fontWeight: 700, color: '#FF4D4D' }}>
                        Decline
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={() => handleAcknowledgeAssignment(assignment.id)}
                      disabled={processingId === assignment.id || celebratingId === assignment.id}
                      className="flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                        boxShadow: '0 4px 12px rgba(75, 92, 251, 0.3)',
                      }}
                      whileTap={processingId !== assignment.id ? { scale: 0.95 } : {}}
                    >
                      <CheckCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
                      <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                        Acknowledge
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
            );
          }
          
          // Render Deliverable
          if (item.type === 'deliverable') {
            const submission = item.data;
            return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: celebratingId === submission.id ? 0 : 1, 
                    x: 0,
                    scale: celebratingId === submission.id ? 0.95 : 1,
                  }}
                  transition={{ 
                    delay: celebratingId === submission.id ? 0 : (filteredReceivedSubWORequests.length + assignmentsToMe.length + index) * 0.05,
                    duration: celebratingId === submission.id ? 0.3 : 0.2,
                  }}
                  className={`p-4 rounded-3xl border transition-all relative overflow-hidden ${
                    submission.status === 'pending-approval'
                      ? isDarkMode
                        ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                        : 'bg-card border-primary/40'
                      : 'bg-card border-border/40'
                  }`}
                  style={celebratingId !== submission.id && !isDarkMode && submission.status === 'pending-approval' ? {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  } : celebratingId === submission.id ? {
                    boxShadow: celebrationType === 'approved' 
                      ? '0 0 30px rgba(0, 199, 183, 0.5), 0 0 60px rgba(0, 199, 183, 0.3)'
                      : '0 0 30px rgba(255, 77, 77, 0.5), 0 0 60px rgba(255, 77, 77, 0.3)',
                  } : {}}
                >
                  {/* Celebration Overlay */}
                  {celebratingId === submission.id && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center z-10 rounded-3xl"
                      style={{
                        background: celebrationType === 'approved'
                          ? 'linear-gradient(135deg, rgba(0, 214, 143, 0.95) 0%, rgba(0, 199, 183, 0.95) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 77, 77, 0.95) 0%, rgba(255, 107, 107, 0.95) 100%)',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        >
                          {celebrationType === 'approved' ? (
                            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-2" strokeWidth={2.5} />
                          ) : (
                            <XCircle className="w-16 h-16 text-white mx-auto mb-2" strokeWidth={2.5} />
                          )}
                        </motion.div>
                        <motion.p
                          className="text-white text-lg"
                          style={{ fontWeight: 700 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {celebrationType === 'approved' ? 'Approved!' : 'Denied!'}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Left: User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                        }}
                      >
                        <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                          {submission.assignedToName?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {submission.assignedToName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                          {submission.assignedToRole}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right: Type Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: 'rgba(0, 199, 183, 0.2)'
                      }}
                    >
                      <Package className="w-3 h-3" strokeWidth={2} style={{ color: '#00C7B7' }} />
                      <span className="text-xs" style={{ fontWeight: 700, color: '#00C7B7' }}>
                        Deliverable
                      </span>
                    </div>
                  </div>

                  {/* Sub Work Order Info */}
                  <div className="mb-4 p-3 rounded-2xl"
                    style={{ 
                      background: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.03)' 
                        : 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <p className="mb-1" style={{ fontWeight: 600 }}>
                      {submission.subWorkOrderName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />
                      <span style={{ fontWeight: 500 }}>{submission.parentWorkOrderId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                        <span style={{ fontWeight: 600, color: '#4B5CFB' }}>
                          {submission.allocatedHours}h allocated
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                        <span className="text-muted-foreground" style={{ fontWeight: 500 }}>
                          Due {new Date(submission.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-4 p-3 rounded-2xl border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                        DELIVERABLES
                      </p>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed" style={{ fontWeight: 500 }}>
                      {submission.deliverables}
                    </p>
                  </div>

                  {/* Deliverable Notes */}
                  {submission.deliverableNotes && (
                    <div className="mb-4 p-3 rounded-2xl border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                          SUBMISSION NOTES
                        </p>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed" style={{ fontWeight: 500 }}>
                        {submission.deliverableNotes}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {submission.deliverableAttachments && submission.deliverableAttachments.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                          ATTACHMENTS ({submission.deliverableAttachments.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {submission.deliverableAttachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border/30"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate" style={{ fontWeight: 600 }}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                {file.size}
                              </p>
                            </div>
                            <Download className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions - Only for pending-approval deliverables */}
                  {submission.status === 'pending-approval' && (
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleApproveDeliverable(submission.id)}
                        disabled={processingId === submission.id}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center ${
                          processingId === submission.id
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'text-white'
                        }`}
                        style={processingId === submission.id ? { fontWeight: 600 } : { 
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)'
                        }}
                        whileHover={processingId !== submission.id ? { scale: 1.01 } : {}}
                        whileTap={processingId !== submission.id ? { scale: 0.99 } : {}}
                      >
                        {processingId === submission.id ? (
                          <>
                            <motion.div
                              className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            Approve
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleRejectDeliverable(submission.id)}
                        disabled={processingId === submission.id}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center ${
                          processingId === submission.id
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-muted/50 hover:bg-muted text-destructive'
                        }`}
                        style={{ fontWeight: 600 }}
                        whileHover={processingId !== submission.id ? { scale: 1.01 } : {}}
                        whileTap={processingId !== submission.id ? { scale: 0.99 } : {}}
                      >
                        <XCircle className="w-4 h-4" strokeWidth={2} />
                        Reject
                      </motion.button>
                    </div>
                  )}

                  {/* Status Messages */}
                  {submission.status === 'approved' && submission.approvedAt && (
                    <div className={`p-2.5 rounded-lg flex items-center gap-2 mt-4 ${
                      isDarkMode ? 'bg-secondary/10' : 'bg-secondary/5'
                    }`}>
                      <CheckCheck className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                      <p className="text-xs text-secondary" style={{ fontWeight: 500 }}>
                        Approved {formatDate(submission.approvedAt)}
                      </p>
                    </div>
                  )}

                  {submission.status === 'rejected' && submission.rejectedAt && (
                    <div className={`p-2.5 rounded-lg flex items-center gap-2 mt-4 ${
                      isDarkMode ? 'bg-destructive/10' : 'bg-destructive/5'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                      <p className="text-xs text-destructive" style={{ fontWeight: 500 }}>
                        Rejected {formatDate(submission.rejectedAt)}
                      </p>
                    </div>
                  )}
                </motion.div>
            );
          }
          
          // Fallback - should never reach here
          return null;
        })}
      </div>
    );
  };

  const renderMyRequestsTab = () => {
    const hasSentAccessRequests = filteredSentSubWORequests.length > 0;
    const hasSentDeliverables = filteredSentDeliverables.length > 0;

    if (!hasSentAccessRequests && !hasSentDeliverables) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-muted/30' : 'bg-muted/50'
          }`}>
            <Send className="w-7 h-7 text-muted-foreground" strokeWidth={2} />
          </div>
          <p className="text-sm text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
            No requests sent
          </p>
          <p className="text-xs text-muted-foreground text-center" style={{ fontWeight: 500 }}>
            Your access requests and deliverable submissions will appear here
          </p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Sent Access Requests */}
        {hasSentAccessRequests && (
          <div>
            <div className="space-y-3 px-4">
              {filteredSentSubWORequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-3xl border transition-all ${
                    request.status === 'pending'
                      ? isDarkMode
                        ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                        : 'bg-card border-primary/40'
                      : 'bg-card border-border/40'
                  }`}
                  style={request.status === 'pending' && !isDarkMode ? {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  } : {}}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Left: User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                        }}
                      >
                        <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                          {request.ownerName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {request.ownerName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                          Owner
                        </p>
                      </div>
                    </div>
                    
                    {/* Right: Status Badge */}
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: 'rgba(240, 187, 0, 0.2)'
                        }}
                      >
                        <Clock className="w-3 h-3" strokeWidth={2} style={{ color: '#FFC043' }} />
                        <span className="text-xs" style={{ fontWeight: 700, color: '#FFC043' }}>
                          Pending
                        </span>
                      </div>
                    ) : (
                      getStatusBadge(request.status)
                    )}
                  </div>

                  {/* Work Order Info */}
                  <div className="mb-3 p-4 rounded-2xl border"
                    style={{ 
                      backgroundColor: isDarkMode 
                        ? 'rgba(75, 92, 251, 0.05)' 
                        : 'rgba(75, 92, 251, 0.08)',
                      borderColor: 'rgba(75, 92, 251, 0.1)'
                    }}
                  >
                    {/* Sub Work Order Name */}
                    <p className="text-sm truncate mb-0.5" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {request.subWorkOrderName}
                    </p>
                    
                    {/* Parent Work Order */}
                    <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 500 }}>
                      Parent: {request.workOrderId} - {request.workOrderName}
                    </p>
                    
                    {/* Separator */}
                    <div className="h-px w-full bg-border/30 mb-3" />
                    
                    {/* Date & Time - Single Line */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                        <span className="text-sm text-secondary" style={{ fontWeight: 700 }}>
                          {formatDate(request.startDate)} - {formatDate(request.dueDate)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-secondary" strokeWidth={2} />
                        <span className="text-sm text-secondary" style={{ fontWeight: 700 }}>
                          {request.requestedHours}h requested
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-3 p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
                      DELIVERABLES:
                    </p>
                    <p className="text-xs text-foreground" style={{ fontWeight: 500, lineHeight: '19.2px' }}>
                      {request.deliverables}
                    </p>
                  </div>

                  {/* Reason */}
                  {request.reason && (
                    <div className="mb-3 p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
                        REASON:
                      </p>
                      <p className="text-xs text-foreground" style={{ fontWeight: 500, lineHeight: '19.2px' }}>
                        {request.reason}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Deliverables */}
        {hasSentDeliverables && (
          <div>
            <div className="space-y-3 px-4">
              {filteredSentDeliverables.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-3xl border transition-all ${
                    submission.status === 'pending-approval'
                      ? isDarkMode
                        ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                        : 'bg-card border-primary/40'
                      : 'bg-card border-border/40'
                  }`}
                  style={submission.status === 'pending-approval' && !isDarkMode ? {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  } : {}}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Left: User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                        }}
                      >
                        <span className="text-sm text-white" style={{ fontWeight: 700 }}>
                          {submission.assignedToName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {submission.assignedToName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                          {submission.assignedToRole}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right: Deliverable Chip */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: 'rgba(0, 199, 183, 0.15)',
                        borderColor: 'rgba(0, 199, 183, 0.3)',
                        border: '1.5px solid'
                      }}
                    >
                      <Paperclip className="w-3 h-3" strokeWidth={2} style={{ color: '#00C7B7' }} />
                      <span className="text-xs" style={{ fontWeight: 700, color: '#00C7B7' }}>
                        Deliverable
                      </span>
                    </div>
                  </div>

                  {/* Work Order Info */}
                  <div className="mb-3 p-4 rounded-2xl border"
                    style={{ 
                      backgroundColor: isDarkMode 
                        ? 'rgba(75, 92, 251, 0.05)' 
                        : 'rgba(75, 92, 251, 0.08)',
                      borderColor: 'rgba(75, 92, 251, 0.1)'
                    }}
                  >
                    {/* Sub Work Order Name */}
                    <p className="text-sm truncate mb-0.5" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {submission.subWorkOrderName}
                    </p>
                    
                    {/* Parent Work Order ID */}
                    <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 500 }}>
                      {submission.parentWorkOrderId} • {submission.parentWorkOrderName}
                    </p>
                    
                    {/* Separator */}
                    <div className="h-px w-full bg-border/30 mb-3" />
                    
                    {/* Expected Deliverables */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
                        EXPECTED DELIVERABLES:
                      </p>
                      <p className="text-xs text-foreground" style={{ fontWeight: 500, lineHeight: '19.2px' }}>
                        {submission.deliverables}
                      </p>
                    </div>
                  </div>

                  {/* Submission Notes */}
                  {submission.deliverableNotes && (
                    <div className="mb-3 p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1.5" style={{ fontWeight: 600 }}>
                        SUBMISSION NOTES:
                      </p>
                      <p className="text-xs text-foreground" style={{ fontWeight: 500, lineHeight: '19.2px' }}>
                        {submission.deliverableNotes}
                      </p>
                    </div>
                  )}

                  {/* Attachments - Prominently displayed */}
                  {submission.deliverableAttachments && submission.deliverableAttachments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2.5" style={{ fontWeight: 600 }}>
                        ATTACHED FILES ({submission.deliverableAttachments.length}):
                      </p>
                      <div className="space-y-2">
                        {submission.deliverableAttachments.map((file: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)' }}
                            >
                              <FileText className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                                {file.size} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                              </p>
                            </div>
                            <motion.button
                              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
                              whileTap={{ scale: 0.95 }}
                            >
                              <Download className="w-4 h-4 text-primary" strokeWidth={2} />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted Date */}
                  {submission.deliverableSubmittedAt && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                        Submitted on {new Date(submission.deliverableSubmittedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Actions - Only for pending-approval */}
                  {submission.status === 'pending-approval' && (
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleApproveDeliverable(submission.id)}
                        disabled={processingId === submission.id}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center ${
                          processingId === submission.id
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'text-white'
                        }`}
                        style={processingId === submission.id ? { fontWeight: 600 } : { 
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)'
                        }}
                        whileHover={processingId !== submission.id ? { scale: 1.01 } : {}}
                        whileTap={processingId !== submission.id ? { scale: 0.99 } : {}}
                      >
                        {processingId === submission.id ? (
                          <>
                            <motion.div
                              className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            Approve
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleRejectDeliverable(submission.id)}
                        disabled={processingId === submission.id}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-center ${
                          processingId === submission.id
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-muted/50 hover:bg-muted text-destructive'
                        }`}
                        style={{ fontWeight: 600 }}
                        whileHover={processingId !== submission.id ? { scale: 1.01 } : {}}
                        whileTap={processingId !== submission.id ? { scale: 0.99 } : {}}
                      >
                        <XCircle className="w-4 h-4" strokeWidth={2} />
                        Reject
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderHistoryTab = () => {
    // Get all completed items (approved, denied, rejected) - must filter from full lists
    const allReceivedSubWORequests = subWorkOrders.filter(swo => swo.assignedById === currentUser.id);
    const allSentSubWORequests = subWorkOrders.filter(swo => swo.assignedToId === currentUser.id);
    
    const historySubWORequests = [...allReceivedSubWORequests, ...allSentSubWORequests].filter(
      swo => swo.status === 'approved' || swo.status === 'denied'
    );
    const historyDeliverables = [...allReceivedSubWORequests, ...allSentSubWORequests].filter(
      swo => swo.status === 'deliverable-approved' || swo.status === 'deliverable-rejected'
    );

    // Combine and sort by date (most recent first)
    const allHistory = [
      ...historySubWORequests.map(req => ({
        ...req,
        type: 'access-request' as const,
        timestamp: req.approvedAt || req.deniedAt || req.createdAt,
        decidedBy: req.approvedBy || req.deniedBy,
        isReceivedByMe: req.assignedById === currentUser.id,
        requesterName: req.assignedToName,
        requesterRole: req.assignedToRole,
        ownerName: req.assignedByName,
      })),
      ...historyDeliverables.map(sub => ({
        ...sub,
        type: 'deliverable' as const,
        timestamp: sub.approvedAt || sub.rejectedAt || sub.submittedAt,
        decidedBy: sub.approvedBy || sub.rejectedBy,
        isReceivedByMe: sub.assignedById === currentUser.id,
        assignedToName: sub.assignedToName,
        assignedToRole: sub.assignedToRole,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (allHistory.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-muted/30' : 'bg-muted/50'
          }`}>
            <History className="w-7 h-7 text-muted-foreground" strokeWidth={2} />
          </div>
          <p className="text-sm text-muted-foreground mb-1" style={{ fontWeight: 600 }}>
            No approval history yet
          </p>
          <p className="text-xs text-muted-foreground text-center" style={{ fontWeight: 500 }}>
            Completed approvals and requests will appear here
          </p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-3 px-4">
        {allHistory.map((item, index) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-3xl border-2 transition-all relative ${
              item.isReceivedByMe
                ? isDarkMode 
                  ? 'bg-card border-primary/30 shadow-lg shadow-primary/5' 
                  : 'bg-card border-primary/40'
                : isDarkMode
                  ? 'bg-card border-border/40'
                  : 'bg-card border-border/30'
            }`}
            style={!isDarkMode ? {
              boxShadow: item.isReceivedByMe 
                ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
            } : {}}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              {/* Left: User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ 
                      background: item.isReceivedByMe
                        ? 'linear-gradient(135deg, #4B5CFB 0%, #6B7CFF 100%)'
                        : 'linear-gradient(135deg, #F0BB00 0%, #FFD700 100%)',
                    }}
                  >
                    <span className="text-xs text-white" style={{ fontWeight: 700 }}>
                      {item.type === 'access-request' 
                        ? (item as any).requesterName?.split(' ').map((n: string) => n[0]).join('')
                        : (item as any).assignedToName?.split(' ').map((n: string) => n[0]).join('')
                      }
                    </span>
                  </div>
                  {/* Direction Indicator Icon */}
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2"
                    style={{ 
                      backgroundColor: item.isReceivedByMe ? '#4B5CFB' : '#F0BB00',
                      borderColor: isDarkMode ? '#1a1a1a' : '#ffffff'
                    }}
                  >
                    {item.isReceivedByMe ? (
                      <CheckCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    ) : (
                      <Send className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {item.type === 'access-request' ? (item as any).requesterName : (item as any).assignedToName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                    {item.type === 'access-request' ? (item as any).requesterRole : (item as any).assignedToRole}
                  </p>
                </div>
              </div>
              
              {/* Right: Status Badge */}
              <div className="flex-shrink-0">
                {item.status === 'approved' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/30">
                    <CheckCircle2 className="w-3 h-3 text-secondary" strokeWidth={2} />
                    <span className="text-xs text-secondary" style={{ fontWeight: 600 }}>
                      Approved
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/30">
                    <XCircle className="w-3 h-3 text-destructive" strokeWidth={2} />
                    <span className="text-xs text-destructive" style={{ fontWeight: 600 }}>
                      {item.status === 'denied' ? 'Denied' : 'Rejected'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Work Order Info */}
            <div className="mb-3 p-3 rounded-2xl border"
              style={{ 
                backgroundColor: isDarkMode 
                  ? 'rgba(75, 92, 251, 0.05)' 
                  : 'rgba(75, 92, 251, 0.08)',
                borderColor: 'rgba(75, 92, 251, 0.1)'
              }}
            >
              <p className="text-xs truncate mb-0.5" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                {item.workOrderName}
              </p>
              <p className="text-[10px] text-muted-foreground" style={{ fontWeight: 500 }}>
                {item.workOrderId}
              </p>
            </div>

            {/* Bottom Info Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                {item.type === 'access-request' ? (
                  <>
                    <User className="w-3 h-3" strokeWidth={2} />
                    <span style={{ fontWeight: 500 }}>Time Request</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3 h-3" strokeWidth={2} />
                    <span style={{ fontWeight: 500 }}>Deliverable</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3 h-3" strokeWidth={2} />
                <span style={{ fontWeight: 500 }}>
                  {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
                </span>
              </div>
            </div>

            {/* Decision Indicator */}
            <div className="mt-3 pt-3 border-t border-border/20">
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                {item.isReceivedByMe ? (
                  <>You {item.status === 'approved' ? 'approved' : item.status === 'denied' ? 'denied' : 'rejected'} this request</>
                ) : (
                  <>{item.status === 'approved' ? 'Approved' : item.status === 'denied' ? 'Denied' : 'Rejected'} by {item.type === 'access-request' ? (item as any).ownerName : (item as any).ownerName}</>
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/30">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('timer')}
              className="p-2 hover:bg-muted rounded-lg transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="flex-1">
              <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Approval Centre
              </h2>
            </div>
            <motion.button
              onClick={() => setActiveTab('history')}
              className={`p-2 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              aria-label="View History"
              whileTap={{ scale: 0.95 }}
            >
              <History className="w-5 h-5" strokeWidth={2} />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <motion.button
              onClick={() => setActiveTab('for-approval')}
              className={`flex-1 py-3.5 px-3 rounded-xl text-xs text-center transition-all relative ${
                activeTab === 'for-approval'
                  ? 'bg-primary text-primary-foreground border-2 border-primary shadow-sm'
                  : 'bg-card text-foreground/70 hover:bg-card/80 border-2 border-border/40'
              }`}
              style={{ fontWeight: 600 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Bell className="w-3.5 h-3.5 mb-0.5" strokeWidth={2} />
                <span className="leading-tight">For Approval</span>
              </div>
              {assignmentsToMe.length > 0 && (
                <div 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{ 
                    backgroundColor: '#FF4D4D',
                    color: 'white',
                    fontWeight: 700,
                    border: '2px solid',
                    borderColor: isDarkMode ? '#1a1a1a' : '#ffffff'
                  }}
                >
                  {assignmentsToMe.length}
                </div>
              )}
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 py-3.5 px-3 rounded-xl text-xs text-center transition-all ${
                activeTab === 'my-requests'
                  ? 'bg-primary text-primary-foreground border-2 border-primary shadow-sm'
                  : 'bg-card text-foreground/70 hover:bg-card/80 border-2 border-border/40'
              }`}
              style={{ fontWeight: 600 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Send className="w-3.5 h-3.5 mb-0.5" strokeWidth={2} />
                <span className="leading-tight">My Requests</span>
              </div>
            </motion.button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
              <Input
                type="text"
                placeholder="Search by name, work order..."
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

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Type Filter */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
                      TYPE
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        onClick={() => setTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs text-center transition-all ${
                          typeFilter === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                        style={{ fontWeight: 600 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      <motion.button
                        onClick={() => setTypeFilter('access-request')}
                        className={`px-3 py-1.5 rounded-lg text-xs text-center transition-all ${
                          typeFilter === 'access-request'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                        style={{ fontWeight: 600 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Time Requests
                      </motion.button>
                      <motion.button
                        onClick={() => setTypeFilter('deliverable')}
                        className={`px-3 py-1.5 rounded-lg text-xs text-center transition-all ${
                          typeFilter === 'deliverable'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                        style={{ fontWeight: 600 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sub-WO Tasks
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'for-approval' ? -20 : activeTab === 'my-requests' ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'for-approval' ? 20 : activeTab === 'my-requests' ? 0 : -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {activeTab === 'for-approval' ? renderForApprovalTab() : activeTab === 'my-requests' ? renderMyRequestsTab() : renderHistoryTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};