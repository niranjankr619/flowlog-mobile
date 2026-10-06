import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Upload,
  Send,
  ChevronRight,
  Briefcase,
  Target,
  X,
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { mockWorkOrders } from '../lib/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { BottomNav } from './BottomNav';

export const MySubWorkOrders = () => {
  const { setCurrentScreen, currentUser, subWorkOrders, setSubWorkOrders, theme } = useApp();
  const [selectedSubWO, setSelectedSubWO] = useState<string | null>(null);
  const [showDeliverableSheet, setShowDeliverableSheet] = useState(false);
  const [showCompletionSheet, setShowCompletionSheet] = useState(false);
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [completionNotes, setCompletionNotes] = useState('');

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isLightTheme = !isDark;

  // Filter Sub Work Orders assigned to current user
  const mySubWorkOrders = subWorkOrders.filter(
    swo => swo.assignedToId === currentUser.id && 
           (swo.status === 'active' || swo.status === 'pending-acknowledgment')
  );

  // Get work order details
  const getWorkOrderDetails = (workOrderId: string) => {
    return mockWorkOrders.find(wo => wo.number === workOrderId);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} added`);
    }
  };

  // Handle deliverable submission
  const handleSubmitDeliverable = () => {
    if (!selectedSubWO || uploadedFiles.length === 0) {
      toast.error('Please attach at least one file');
      return;
    }

    const updatedSubWorkOrders = subWorkOrders.map(swo => {
      if (swo.id === selectedSubWO) {
        const existingDeliverables = (swo as any).submittedDeliverables || [];
        return {
          ...swo,
          submittedDeliverables: [
            ...existingDeliverables,
            {
              id: `del-${Date.now()}`,
              notes: deliverableNotes,
              attachments: uploadedFiles.map(f => ({
                name: f.name,
                size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                type: f.type,
              })),
              submittedAt: new Date().toISOString(),
            },
          ],
        };
      }
      return swo;
    });

    setSubWorkOrders(updatedSubWorkOrders);
    toast.success('Deliverable submitted!', {
      description: 'Owner can view your submission',
      duration: 3000,
    });

    // Reset
    setShowDeliverableSheet(false);
    setDeliverableNotes('');
    setUploadedFiles([]);
  };

  // Handle request completion
  const handleRequestCompletion = () => {
    if (!selectedSubWO) return;

    const subWO = subWorkOrders.find(s => s.id === selectedSubWO);
    const hasDeliverables = (subWO as any)?.submittedDeliverables?.length > 0;

    if (!hasDeliverables) {
      toast.error('Please submit at least one deliverable before requesting completion');
      return;
    }

    // Update status to pending-approval
    const updatedSubWorkOrders = subWorkOrders.map(swo => {
      if (swo.id === selectedSubWO) {
        return {
          ...swo,
          status: 'pending-approval' as const,
          completionRequestedAt: new Date().toISOString(),
          completionNotes: completionNotes,
        };
      }
      return swo;
    });

    setSubWorkOrders(updatedSubWorkOrders);
    toast.success('Completion requested!', {
      description: 'Sent to owner for approval',
      duration: 3000,
    });

    // Reset and go back
    setShowCompletionSheet(false);
    setCompletionNotes('');
    setSelectedSubWO(null);
  };

  // Detailed view
  if (selectedSubWO) {
    const subWO = mySubWorkOrders.find(s => s.id === selectedSubWO);
    if (!subWO) return null;

    const workOrder = getWorkOrderDetails(subWO.parentWorkOrderId);
    const progressPercent = Math.round((subWO.usedMinutes / subWO.allocatedMinutes) * 100);
    const submittedDeliverables = (subWO as any).submittedDeliverables || [];
    const hasDeliverables = submittedDeliverables.length > 0;

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
                  Sub Work Order
                </h2>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  {subWO.subWorkOrderName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Parent Work Order Info */}
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
                PARENT WORK ORDER
              </p>
            </div>
            <h3 className="mb-1" style={{ fontWeight: 700 }}>
              {subWO.parentWorkOrderName}
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
              {subWO.parentWorkOrderId}
            </p>
            {workOrder && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                <span>{workOrder.client}</span>
                <span>•</span>
                <span>{workOrder.department}</span>
              </div>
            )}
          </div>

          {/* Progress Card */}
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
            <h4 className="mb-3" style={{ fontWeight: 700 }}>
              Time Progress
            </h4>
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
                <p className="text-xl mb-1" style={{ fontWeight: 700, color: '#4B5CFB' }}>
                  {Math.round(subWO.usedMinutes / 60 * 10) / 10}h
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  Used
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xl mb-1" style={{ fontWeight: 700, color: '#00C7B7' }}>
                  {Math.round(subWO.remainingMinutes / 60 * 10) / 10}h
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                  Remaining
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #4B5CFB 0%, #00C7B7 100%)',
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

          {/* Deliverables Section */}
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
                  backgroundColor: hasDeliverables ? 'rgba(0, 199, 183, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: hasDeliverables ? '#00C7B7' : '#888',
                  fontWeight: 600,
                  border: `1px solid ${hasDeliverables ? 'rgba(0, 199, 183, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                } : {
                  backgroundColor: hasDeliverables ? 'rgba(0, 199, 183, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                  color: hasDeliverables ? '#008C7A' : '#666',
                  fontWeight: 600,
                  border: `1px solid ${hasDeliverables ? 'rgba(0, 199, 183, 0.35)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                {submittedDeliverables.length} Submitted
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3 leading-relaxed" style={{ fontWeight: 500 }}>
              {subWO.deliverables}
            </p>

            {/* Submitted Deliverables List */}
            {submittedDeliverables.length > 0 && (
              <div className="space-y-2 mb-3">
                {submittedDeliverables.map((del: any, idx: number) => (
                  <div key={del.id} className="p-3 rounded-lg bg-muted/30 border border-border/20">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5" strokeWidth={2} />
                      <div className="flex-1">
                        <p className="text-xs" style={{ fontWeight: 600 }}>
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
            )}

            {/* Submit New Deliverable Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDeliverableSheet(true)}
              style={{ fontWeight: 600 }}
            >
              <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
              Submit New Deliverable
            </Button>
          </div>
        </div>

        {/* Request Completion CTA */}
        <div className="fixed bottom-20 left-0 right-0 glass-overlay border-t border-border/30 p-4 pb-safe">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              if (!hasDeliverables) {
                toast.error('Please submit at least one deliverable first');
                return;
              }
              setShowCompletionSheet(true);
            }}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)'
                : 'linear-gradient(135deg, #3443D9 0%, #008C7A 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
            }}
          >
            <Send className="w-5 h-5 mr-2" strokeWidth={2} />
            Request Completion
          </Button>
        </div>

        {/* Deliverable Upload Sheet */}
        <Sheet open={showDeliverableSheet} onOpenChange={setShowDeliverableSheet}>
          <SheetContent side="bottom" className="h-[85vh] p-0 overflow-hidden">
            <div className="flex flex-col h-full bg-background">
              <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2 mb-0">
                    <Target className="w-5 h-5 text-accent" strokeWidth={2} />
                    <span style={{ fontWeight: 700 }}>Submit Deliverable</span>
                  </SheetTitle>
                  <button
                    onClick={() => setShowDeliverableSheet(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                <SheetDescription className="text-left mt-2" style={{ fontWeight: 500 }}>
                  Upload files and add notes for your deliverable
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                    Attachments
                  </label>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" strokeWidth={2} />
                    <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                      Tap to upload files
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                      UPLOADED FILES ({uploadedFiles.length})
                    </p>
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <FileCheck className="w-4 h-4 text-primary" strokeWidth={2} />
                        <span className="flex-1 text-sm truncate" style={{ fontWeight: 500 }}>
                          {file.name}
                        </span>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-destructive/20 rounded transition-all"
                        >
                          <X className="w-3.5 h-3.5 text-destructive" strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                    Notes (Optional)
                  </label>
                  <Textarea
                    value={deliverableNotes}
                    onChange={(e) => setDeliverableNotes(e.target.value)}
                    placeholder="Add any notes about this deliverable..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border/30">
                <Button
                  className="w-full"
                  onClick={handleSubmitDeliverable}
                  disabled={uploadedFiles.length === 0}
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)'
                      : 'linear-gradient(135deg, #3443D9 0%, #008C7A 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  Submit Deliverable
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Completion Request Sheet */}
        <Sheet open={showCompletionSheet} onOpenChange={setShowCompletionSheet}>
          <SheetContent side="bottom" className="h-[70vh] p-0 overflow-hidden">
            <div className="flex flex-col h-full bg-background">
              <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2 mb-0">
                    <Send className="w-5 h-5 text-primary" strokeWidth={2} />
                    <span style={{ fontWeight: 700 }}>Request Completion</span>
                  </SheetTitle>
                  <button
                    onClick={() => setShowCompletionSheet(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                <SheetDescription className="text-left mt-2" style={{ fontWeight: 500 }}>
                  Send this sub work order to owner for final approval
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Summary */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-primary" strokeWidth={2} />
                    <p className="text-sm" style={{ fontWeight: 700 }}>Summary</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground" style={{ fontWeight: 500 }}>Time Used:</span>
                      <span style={{ fontWeight: 600 }}>
                        {Math.round(subWO!.usedMinutes / 60 * 10) / 10}h / {Math.round(subWO!.allocatedMinutes / 60 * 10) / 10}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground" style={{ fontWeight: 500 }}>Deliverables:</span>
                      <span style={{ fontWeight: 600 }}>{submittedDeliverables.length} submitted</span>
                    </div>
                  </div>
                </div>

                {/* Completion Notes */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                    Completion Notes (Optional)
                  </label>
                  <Textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add any final notes or comments..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border/30">
                <Button
                  className="w-full"
                  onClick={handleRequestCompletion}
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)'
                      : 'linear-gradient(135deg, #3443D9 0%, #008C7A 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  <Send className="w-5 h-5 mr-2" strokeWidth={2} />
                  Send for Approval
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <BottomNav currentScreen="time-entries" />
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
              onClick={() => setCurrentScreen('time-entries')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              My Sub Work Orders
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
                {mySubWorkOrders.length}
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
                {mySubWorkOrders.reduce((sum, swo) => sum + Math.round(swo.usedMinutes / 60), 0)}h
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                Logged
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
                {mySubWorkOrders.reduce((sum, swo) => sum + Math.round(swo.remainingMinutes / 60), 0)}h
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                Remaining
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Work Orders List */}
      <div className="p-4 space-y-3">
        {mySubWorkOrders.length === 0 ? (
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
            <FileCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={2} />
            <h3 className="mb-2" style={{ fontWeight: 700 }}>
              No Active Sub Work Orders
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
              You don't have any active sub work orders at the moment.
            </p>
          </motion.div>
        ) : (
          mySubWorkOrders.map((subWO, index) => {
            const workOrder = getWorkOrderDetails(subWO.parentWorkOrderId);
            const progressPercent = Math.round((subWO.usedMinutes / subWO.allocatedMinutes) * 100);
            const submittedDeliverables = (subWO as any).submittedDeliverables || [];

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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-1 truncate" style={{ fontWeight: 700 }}>
                      {subWO.subWorkOrderName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate" style={{ fontWeight: 500 }}>
                      {subWO.parentWorkOrderName}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" strokeWidth={2} />
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                      TIME PROGRESS
                    </span>
                    <span className="text-xs" style={{ fontWeight: 700, color: '#4B5CFB' }}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #4B5CFB 0%, #00C7B7 100%)',
                        width: `${Math.min(progressPercent, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <span className="text-xs" style={{ fontWeight: 600 }}>
                        {Math.round(subWO.usedMinutes / 60 * 10) / 10}h / {Math.round(subWO.allocatedMinutes / 60 * 10) / 10}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      <span className="text-xs" style={{ fontWeight: 600 }}>
                        {submittedDeliverables.length} deliverable{submittedDeliverables.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      <BottomNav currentScreen="time-entries" />
    </div>
  );
};
