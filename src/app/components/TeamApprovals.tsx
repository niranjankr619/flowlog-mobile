import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  ChevronRight,
  Calendar,
  Briefcase,
  Users,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Timer,
  Eye,
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { mockWorkOrders } from '../lib/mockData';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { BottomNav } from './BottomNav';

export const TeamApprovals = () => {
  const { setCurrentScreen, currentUser, subWorkOrders, setSubWorkOrders } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // Filter Sub Work Orders where current user is the owner (assignedById)
  // Show pending requests and pending deliverable approvals
  const myPendingApprovals = subWorkOrders.filter(
    swo => swo.assignedById === currentUser.id && 
           (swo.status === 'pending' || swo.status === 'pending-approval')
  );

  const pendingRequestsCount = myPendingApprovals.filter(swo => swo.status === 'pending').length;
  const pendingDeliverablesCount = myPendingApprovals.filter(swo => swo.status === 'pending-approval').length;
  const totalPendingCount = myPendingApprovals.length;

  const handleApproveRequest = (subWorkOrder: any) => {
    // Approve Sub Work Order request
    const updatedSubWorkOrders = subWorkOrders.map(swo => 
      swo.id === subWorkOrder.id 
        ? { 
            ...swo, 
            status: 'active' as const,
            allocatedHours: swo.requestedHours,
            allocatedMinutes: (swo.requestedHours || 0) * 60,
            remainingMinutes: (swo.requestedHours || 0) * 60,
            approvedAt: new Date().toISOString(),
            subWorkOrderNumber: `${swo.parentWorkOrderId}-SUB-${String(subWorkOrders.length + 1).padStart(3, '0')}`,
          }
        : swo
    );
    setSubWorkOrders(updatedSubWorkOrders);
    toast.success(`Approved ${subWorkOrder.allocatedHours || subWorkOrder.requestedHours}h allocation to ${subWorkOrder.assignedToName}`, {
      icon: '✓',
    });
    setSelectedRequest(null);
  };

  const handleRejectRequest = (subWorkOrder: any) => {
    // Reject Sub Work Order request - remove it
    const updatedSubWorkOrders = subWorkOrders.filter(swo => swo.id !== subWorkOrder.id);
    setSubWorkOrders(updatedSubWorkOrders);
    toast.error(`Rejected request from ${subWorkOrder.assignedToName}`, {
      icon: '✗',
    });
    setSelectedRequest(null);
  };

  const handleApproveDeliverable = (subWorkOrder: any) => {
    // Approve deliverable and mark as completed
    const updatedSubWorkOrders = subWorkOrders.map(swo => 
      swo.id === subWorkOrder.id 
        ? { 
            ...swo, 
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            approvedMinutes: swo.usedMinutes,
          }
        : swo
    );
    setSubWorkOrders(updatedSubWorkOrders);
    toast.success(`Approved deliverable from ${subWorkOrder.assignedToName}`, {
      icon: '✓',
    });
    setSelectedRequest(null);
  };

  const handleRejectDeliverable = (subWorkOrder: any) => {
    // Reject deliverable - return to active status
    const updatedSubWorkOrders = subWorkOrders.map(swo => 
      swo.id === subWorkOrder.id 
        ? { 
            ...swo, 
            status: 'active' as const,
            deliverableSubmittedAt: undefined,
            deliverableNotes: undefined,
            deliverableAttachments: undefined,
          }
        : swo
    );
    setSubWorkOrders(updatedSubWorkOrders);
    toast.error(`Rejected deliverable from ${subWorkOrder.assignedToName}`, {
      icon: '✗',
    });
    setSelectedRequest(null);
  };

  // Get work order details
  const getWorkOrderDetails = (workOrderId: string) => {
    return mockWorkOrders.find(wo => wo.number === workOrderId);
  };

  // Detailed view
  if (selectedRequest) {
    const request = myPendingApprovals.find(r => r.id === selectedRequest);
    if (!request) return null;

    const workOrder = getWorkOrderDetails(request.parentWorkOrderId);
    const isPendingRequest = request.status === 'pending';
    const isPendingDeliverable = request.status === 'pending-approval';

    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-overlay border-b border-border">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h3>{isPendingRequest ? 'Sub Work Order Request' : 'Deliverable Approval'}</h3>
                <p className="text-sm text-muted-foreground">{request.assignedToName}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {isPendingRequest ? (
                <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Pending Request
                </div>
              ) : (
                <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs flex items-center gap-1.5">
                  <FileCheck className="w-3 h-3" />
                  Deliverable Submitted
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="p-4 space-y-3">
          {/* Work Order Info */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Parent Work Order</p>
            </div>
            <h3 className="mb-1">{request.parentWorkOrderName}</h3>
            <p className="text-sm text-muted-foreground">{request.parentWorkOrderId}</p>
            {workOrder && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{workOrder.client}</span>
                <span>•</span>
                <span>{workOrder.department}</span>
              </div>
            )}
          </div>

          {/* Sub Work Order Details */}
          <div className="glass-card rounded-xl p-4">
            <h4 className="mb-3">{request.subWorkOrderName}</h4>
            
            {/* Time Allocation */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl mb-1">{isPendingRequest ? request.requestedHours : request.allocatedHours}h</p>
                <p className="text-xs text-muted-foreground">
                  {isPendingRequest ? 'Requested Hours' : 'Allocated Hours'}
                </p>
              </div>
              {!isPendingRequest && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl mb-1">{Math.round(request.usedMinutes / 60 * 10) / 10}h</p>
                  <p className="text-xs text-muted-foreground">Used Hours</p>
                </div>
              )}
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">Deliverables</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {request.deliverables}
              </p>
            </div>

            {/* Request Reason (for pending requests) */}
            {isPendingRequest && request.requestReason && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">Request Reason</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {request.requestReason}
                </p>
              </div>
            )}

            {/* Deliverable Notes (for deliverable approval) */}
            {isPendingDeliverable && request.deliverableNotes && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="text-sm">Deliverable Notes</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {request.deliverableNotes}
                </p>
                
                {/* Attachments */}
                {request.deliverableAttachments && request.deliverableAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Attachments</p>
                    {request.deliverableAttachments.map((attachment: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-xs"
                      >
                        <FileCheck className="w-3 h-3 text-muted-foreground" />
                        <span className="flex-1">{attachment.name}</span>
                        <span className="text-muted-foreground">{attachment.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Start: {new Date(request.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requester Info */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{request.assignedToName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4>{request.assignedToName}</h4>
                <p className="text-sm text-muted-foreground">{request.assignedToRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval actions */}
        <div className="fixed bottom-20 left-0 right-0 glass-overlay border-t border-border p-4 pb-safe">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (isPendingRequest) {
                    handleRejectRequest(request);
                  } else {
                    handleRejectDeliverable(request);
                  }
                }}
              >
                <X className="w-5 h-5 mr-2" />
                Reject
              </Button>
            </motion.div>
            <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
              <Button
                className="w-full bg-success hover:bg-success/90"
                onClick={() => {
                  if (isPendingRequest) {
                    handleApproveRequest(request);
                  } else {
                    handleApproveDeliverable(request);
                  }
                }}
              >
                <Check className="w-5 h-5 mr-2" />
                Approve
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-overlay border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2>Sub Work Order Approvals</h2>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">{totalPendingCount}</p>
              <p className="text-xs text-muted-foreground">Total Pending</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-2xl mb-1 text-accent">{pendingRequestsCount}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-2xl mb-1 text-primary">{pendingDeliverablesCount}</p>
              <p className="text-xs text-muted-foreground">Deliverables</p>
            </div>
          </div>

          {/* Quick Link to Surveillance */}
          <button
            onClick={() => setCurrentScreen('sub-work-order-surveillance')}
            className="w-full mt-3 p-3 rounded-xl glass-card hover:border-primary/50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm" style={{ fontWeight: 600 }}>
                View Active Sub Work Orders
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Pending Approvals List */}
      <div className="p-4 space-y-3">
        {myPendingApprovals.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
            <h3 className="mb-2">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground">
              No pending approvals at the moment.
            </p>
          </div>
        ) : (
          myPendingApprovals.map((request, index) => {
            const isPendingRequest = request.status === 'pending';
            const workOrder = getWorkOrderDetails(request.parentWorkOrderId);

            return (
              <motion.button
                key={request.id}
                onClick={() => setSelectedRequest(request.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full glass-card rounded-xl p-4 text-left hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{request.assignedToName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-0.5 truncate">{request.subWorkOrderName}</h4>
                    <p className="text-xs text-muted-foreground">{request.assignedToName}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>

                {/* Work Order Reference */}
                <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Parent Work Order</p>
                  <p className="text-xs">{request.parentWorkOrderName}</p>
                  <p className="text-xs text-muted-foreground">{request.parentWorkOrderId}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {isPendingRequest 
                        ? `${request.requestedHours}h requested`
                        : `${Math.round(request.usedMinutes / 60 * 10) / 10}h used`
                      }
                    </span>
                  </div>

                  <div 
                    className={`px-3 py-1 rounded-full text-xs ${ 
                      isPendingRequest
                        ? 'bg-accent/20 text-accent'
                        : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {isPendingRequest ? 'Request' : 'Deliverable'}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div 
                  className="flex gap-2 mt-3 pt-3 border-t border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPendingRequest) {
                        handleRejectRequest(request);
                      } else {
                        handleRejectDeliverable(request);
                      }
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPendingRequest) {
                        handleApproveRequest(request);
                      } else {
                        handleApproveDeliverable(request);
                      }
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav currentScreen="home" />
    </div>
  );
};