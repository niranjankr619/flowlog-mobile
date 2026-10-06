// TEMPORARY FILE - New unified renderForApprovalTab structure
// This shows the logic for combining all approval items into one list

const renderForApprovalTab = () => {
  // Combine all items into one unified array with type markers
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

  // Sort by timestamp (newest first or oldest first - decide based on UX)
  allApprovalItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (allApprovalItems.length === 0) {
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

  return (
    <div className="space-y-3 px-4">
      {allApprovalItems.map((item, index) => {
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
                  : 'bg-card border-primary/20 shadow-md'
              }`}
              style={celebratingId === request.id ? {
                boxShadow: celebrationType === 'approved' 
                  ? '0 0 30px rgba(0, 199, 183, 0.5), 0 0 60px rgba(0, 199, 183, 0.3)'
                  : '0 0 30px rgba(255, 77, 77, 0.5), 0 0 60px rgba(255, 77, 77, 0.3)',
              } : {}}
            >
              {/* Celebration Overlay */}
              {/* ... celebration code ... */}

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
                
                {/* Right: Request Type Chip - BLUE */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: 'rgba(75, 92, 251, 0.15)',
                    borderColor: 'rgba(75, 92, 251, 0.3)',
                    border: '1.5px solid'
                  }}
                >
                  <Send className="w-3 h-3" strokeWidth={2} style={{ color: '#4B5CFB' }} />
                  <span className="text-xs" style={{ fontWeight: 700, color: '#4B5CFB' }}>
                    Request
                  </span>
                </div>
              </div>

              {/* Rest of request card content */}
            </motion.div>
          );
        } else if (item.type === 'assignment') {
          const assignment = item.data;
          return (
            <motion.div
              key={assignment.id}
              // ... assignment card with YELLOW "Awaiting Ack" chip ...
            >
              {/* Header with YELLOW chip */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: 'rgba(240, 187, 0, 0.2)',
                  border: '1.5px solid rgba(240, 187, 0, 0.3)'
                }}
              >
                <AlertCircle className="w-3 h-3" strokeWidth={2} style={{ color: '#FFC043' }} />
                <span className="text-xs" style={{ fontWeight: 700, color: '#FFC043' }}>
                  Awaiting Ack
                </span>
              </div>
            </motion.div>
          );
        } else { // deliverable
          const submission = item.data;
          return (
            <motion.div
              key={submission.id}
              // ... deliverable card with TEAL "Deliverable" chip ...
            >
              {/* Header with TEAL chip */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: 'rgba(0, 199, 183, 0.15)',
                  border: '1.5px solid rgba(0, 199, 183, 0.3)'
                }}
              >
                <FileText className="w-3 h-3" strokeWidth={2} style={{ color: '#00C7B7' }} />
                <span className="text-xs" style={{ fontWeight: 700, color: '#00C7B7' }}>
                  Deliverable
                </span>
              </div>
            </motion.div>
          );
        }
      })}
    </div>
  );
};
