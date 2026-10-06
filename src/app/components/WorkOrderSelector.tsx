/**
 * Work Order Selector Component
 * 
 * ERP Integration Module - Fetches work orders from company ERP system
 * 
 * Work Order Types:
 * - Direct: Standard work orders with direct time logging
 * - Sequence: Process-based work orders with multiple steps/phases
 * - Collaborative: Work orders shared with other users
 * 
 * ERP Data Fields:
 * - Work Order Number: Unique identifier (e.g., WO-2025-001)
 * - Name: Work order title/description
 * - Client: Customer/client name
 * - Status: Current status (In Progress, Pending, Not Started, etc.)
 * - Priority: Critical, High, Medium, Low
 * - Start Date: Work order start date
 * - Due Date: Expected completion date
 * - Estimated Hours: Planned time allocation
 * - Actual Hours: Time logged so far
 * - Billable Rate: Hourly rate for billable work orders (₹/hour)
 * - Billing Policy: How the work order is billed (Per hour, Per milestone, etc.)
 * - Process Steps: For sequence-type work orders, shows multi-phase breakdown
 * 
 * In production, replace mockWorkOrders with actual ERP API calls:
 * - Use REST API or GraphQL endpoint
 * - Implement real-time syncing
 * - Add authentication headers
 * - Handle loading states and errors
 */

import { motion } from 'motion/react';
import { useState } from 'react';
import { ArrowLeft, Search, Calendar, Clock, CheckCircle2, Lock, AlertCircle, User, List, ChevronRight, Users, ChevronDown, Eye } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { mockWorkOrders, mockOtherActivities, users } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import svgPaths from '../imports/svg-nbcy12g21z';
import { BottomNav } from './BottomNav';

export const WorkOrderSelector = () => {
  const { 
    setCurrentScreen, 
    timerState, 
    setTimerState, 
    workOrderInitialTab, 
    setWorkOrderInitialTab, 
    setSelectedOthersActivity, 
    isZenMode, 
    isEditingEntry, 
    setIsEditingEntry, 
    selectedEntry, 
    setSelectedEntry, 
    theme,
    currentUser,
    subWorkOrders,
    setSelectedWorkOrderForRequest,
    setSelectedWorkOrderForAssignment,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  // Default to 'work-orders' if initial tab was 'all', 'direct', or 'sequence'
  const initialType = ['all', 'direct', 'sequence'].includes(workOrderInitialTab) ? 'work-orders' : workOrderInitialTab;
  const [selectedType, setSelectedType] = useState<'work-orders' | 'collaborative' | 'others'>((initialType as 'work-orders' | 'collaborative' | 'others') || 'work-orders');
  
  // Collaborative sub-tabs: my-access, search
  const [collaborativeTab, setCollaborativeTab] = useState<'my-access' | 'search'>('my-access');
  
  // Sort option for My Access view
  const [accessSort, setAccessSort] = useState<'all' | 'active' | 'pending'>('all');
  
  // Search & Request filters
  const [searchCollaborative, setSearchCollaborative] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Accordion state for process steps
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  
  // Check if dark mode is active
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Get unique values for filters
  const uniqueDepartments = Array.from(new Set(mockWorkOrders.map(wo => wo.department).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(mockWorkOrders.map(wo => wo.status).filter(Boolean)));
  const uniqueClients = Array.from(new Set(mockWorkOrders.map(wo => wo.client).filter(Boolean)));

  // Helper: Check if current user owns a work order
  const isOwner = (workOrder: any) => {
    return workOrder.owner === currentUser.id;
  };

  // Helper: Get access request status for a work order
  const getAccessStatus = (workOrder: any) => {
    const request = subWorkOrders.find(
      swo => swo.parentWorkOrderId === workOrder.number && swo.assignedToId === currentUser.id
    );
    return request || null;
  };

  // Helper: Check if user can select this work order
  const canSelectWorkOrder = (workOrder: any) => {
    if (workOrder.type === 'others') return true; // General activities always accessible
    if (isOwner(workOrder)) return true; // Owner can always select
    const accessStatus = getAccessStatus(workOrder);
    return accessStatus?.status === 'active'; // Can select only if sub WO is active (not pending/completed)
  };

  // Combine work orders and other activities
  const allItems = selectedType === 'others' 
    ? mockOtherActivities 
    : selectedType === 'work-orders'
    ? mockWorkOrders.filter(wo => wo.owner === currentUser.id) // Show only my work orders (both direct and sequence)
    : mockWorkOrders.filter(wo => wo.owner !== currentUser.id); // Show all work orders EXCEPT owned by current user

  // Filter items based on selected type and tab
  let filteredOrders = allItems;

  if (selectedType === 'work-orders') {
    // My Work Orders: simple search
    filteredOrders = allItems.filter((wo) => {
      const matchesSearch = wo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           wo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           wo.client.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  } else if (selectedType === 'others') {
    // General Activities: simple search
    filteredOrders = allItems.filter((wo) => {
      const matchesSearch = wo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           wo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           wo.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  } else if (selectedType === 'collaborative') {
    // Collaborative tab with sub-tabs
    if (collaborativeTab === 'my-access') {
      // My Access: Show WOs with active, pending, or pending-approval Sub WOs only (completed/rejected go to history)
      filteredOrders = allItems.filter((wo) => {
        const accessStatus = getAccessStatus(wo);
        const hasAccess = accessStatus?.status === 'active' || accessStatus?.status === 'pending' || accessStatus?.status === 'pending-approval';
        
        if (!hasAccess) return false;
        
        // Apply sort filter
        if (accessSort === 'all') return true;
        if (accessSort === 'active') return accessStatus?.status === 'active';
        if (accessSort === 'pending') return accessStatus?.status === 'pending' || accessStatus?.status === 'pending-approval';
        
        return false;
      }).filter((wo) => {
        // Apply search filter
        const matchesSearch = searchQuery === '' ||
          wo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          wo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          wo.client.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
    } else if (collaborativeTab === 'search') {
      // Search & Request: Show ONLY WOs where user can request access (no existing sub work order)
      filteredOrders = allItems.filter((wo) => {
        // Only show if user has NO existing sub work order on this WO
        const accessStatus = getAccessStatus(wo);
        if (accessStatus) return false; // Has existing sub WO - don't show in Search & Request
        
        // Unified search across WO Number, EC Number, and Employee Name
        const ownerUser = Object.values(users).find((u: any) => u.id === wo.owner);
        const matchesSearch = searchCollaborative === '' || 
          wo.number.toLowerCase().includes(searchCollaborative.toLowerCase()) ||
          (ownerUser && ownerUser.employeeId.toLowerCase().includes(searchCollaborative.toLowerCase())) ||
          wo.ownerName.toLowerCase().includes(searchCollaborative.toLowerCase());
        
        // Filter dropdowns
        const matchesDepartment = filterDepartment === 'all' || wo.department === filterDepartment;
        const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
        
        return matchesSearch && matchesDepartment && matchesStatus;
      });
    }
  }

  const handleSelectWorkOrder = (workOrder: typeof mockWorkOrders[0], subWOData?: any) => {
    // If we're editing an existing entry, update it and return to entry details
    if (isEditingEntry && selectedEntry) {
      const updatedEntry = {
        ...selectedEntry,
        activityId: workOrder.type === 'others' ? workOrder.id : workOrder.number,
        activityName: workOrder.type === 'others' ? workOrder.number : workOrder.number,
        workOrderType: workOrder.type === 'others' ? 'general' : workOrder.type,
        billable: workOrder.type === 'others' ? false : workOrder.billable,
        rate: workOrder.type === 'others' ? 0 : workOrder.rate,
        // Add sub work order details if present
        isCollaborative: subWOData ? true : false,
        subWorkOrderId: subWOData ? subWOData.id : null,
        workOrderOwner: subWOData ? workOrder.owner : null,
        workOrderOwnerName: subWOData ? workOrder.ownerName : null,
      };
      setSelectedEntry(updatedEntry);
      setIsEditingEntry(false);
      setCurrentScreen('entry-details');
      toast.success(`Activity updated to: ${subWOData ? subWOData.subWorkOrderNumber : workOrder.number}`);
      return;
    }

    // If it's an "Others" activity, set it and navigate to home
    if (workOrder.type === 'others') {
      setSelectedOthersActivity(workOrder);
      setTimerState({
        ...timerState,
        workOrderId: workOrder.id,
        taskName: workOrder.name,
        billable: false,
        rate: 0,
        isCollaborative: false,
        workOrderOwner: null,
        workOrderOwnerName: null,
        subWorkOrderId: null,
      });
      setCurrentScreen('home');
      toast.success(`Selected: ${workOrder.number}`);
      return;
    }

    // Check if this is a sub work order (has subWOData)
    const isSubWorkOrder = subWOData && (subWOData.status === 'active' || subWOData.status === 'completed');

    // For regular work orders or sub work orders, go directly to timer
    setTimerState({
      ...timerState,
      workOrderId: isSubWorkOrder ? subWOData.subWorkOrderNumber : workOrder.number,
      taskName: isSubWorkOrder ? subWOData.subWorkOrderName : workOrder.name,
      activityId: workOrder.number, // CRITICAL: Always use parent WO number as activityId
      activityType: workOrder.type, // Set activity type (direct/sequence)
      workOrderType: workOrder.type, // Set work order type
      billable: workOrder.billable,
      rate: workOrder.rate,
      isCollaborative: isSubWorkOrder,
      workOrderOwner: isSubWorkOrder ? workOrder.owner : null,
      workOrderOwnerName: isSubWorkOrder ? workOrder.ownerName : null,
      subWorkOrderId: isSubWorkOrder ? subWOData.id : null,
    });
    setSelectedOthersActivity(null); // Clear any selected "Others" activity
    setCurrentScreen('home');
    
    if (isSubWorkOrder) {
      toast.success(`Selected sub work order: ${subWOData.subWorkOrderName}`, {
        description: `From ${workOrder.ownerName} • ${subWOData.allocatedHours}h allocated`,
      });
    } else {
      toast.success(`Selected: ${workOrder.name}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#00C7B7';
      case 'Pending': return '#F0BB00';
      case 'Not Started': return '#94A3B8';
      case 'Critical': return '#FF4D4D';
      default: return '#4B5CFB';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#FF4D4D';
      case 'High': return '#FF6B6B';
      case 'Medium': return '#F0BB00';
      case 'Low': return '#94A3B8';
      default: return '#4B5CFB';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle click on work order
  const handleWorkOrderClick = (workOrder: any, subWOData: any, e: React.MouseEvent) => {
    // Special handling for pending sub work orders
    if (subWOData && subWOData.status === 'pending') {
      e.stopPropagation();
      toast.info('Request Pending Approval', {
        description: `Your request for "${subWOData.subWorkOrderName}" is awaiting approval from ${workOrder.ownerName}`,
        duration: 4000,
      });
      return;
    }
    
    // Special handling for pending-approval sub work orders (deliverables submitted)
    if (subWOData && subWOData.status === 'pending-approval') {
      e.stopPropagation();
      toast.info('Deliverable Pending Approval', {
        description: `Your deliverable for "${subWOData.subWorkOrderName}" is awaiting approval from ${workOrder.ownerName}`,
        duration: 4000,
      });
      return;
    }
    
    // If can't select (no access at all), open request access form
    if (!canSelectWorkOrder(workOrder)) {
      e.stopPropagation();
      setSelectedWorkOrderForRequest(workOrder);
      setCurrentScreen('access-request');
      return;
    }
    
    // Otherwise proceed with normal selection, passing sub work order data if present
    handleSelectWorkOrder(workOrder, subWOData);
  };

  return (
    <div 
      className="flex flex-col h-screen relative overflow-hidden"
      style={{
        background: isZenMode 
          ? isDark
            ? 'radial-gradient(ellipse at 50% 50%, hsl(240, 70%, 15%) 0%, hsl(200, 60%, 10%) 50%, hsl(180, 50%, 8%) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, hsl(240, 30%, 95%) 0%, hsl(200, 25%, 97%) 50%, hsl(180, 20%, 98%) 100%)'
          : undefined
      }}
    >
      {/* Zen Mode Background Effect */}
      {isZenMode && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(75, 92, 251, 0.3), transparent 60%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      )}
      
      {/* Header */}
      <div className={`sticky top-0 z-20 ${isZenMode ? (isDark ? 'bg-transparent border-b border-white/10' : 'bg-transparent border-b border-black/10') : 'glass-overlay border-b border-border/50'}`}>
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                if (isEditingEntry) {
                  setIsEditingEntry(false);
                  setCurrentScreen('entry-details');
                } else {
                  setCurrentScreen('home');
                }
              }}
              className={`p-2 rounded-lg transition-all ${
                isZenMode 
                  ? isDark 
                    ? 'bg-white/10 hover:bg-white/15 text-white' 
                    : 'bg-black/5 hover:bg-black/10 text-foreground'
                  : 'hover:bg-muted'
              }`}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <h2 
              className={isZenMode ? (isDark ? 'text-white' : 'text-foreground') : ''}
              style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              Change Activity
            </h2>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto mb-3">
            {(['work-orders', 'collaborative', 'others'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                  selectedType === type
                    ? isZenMode 
                      ? isDark
                        ? 'bg-primary/30 text-white border-2 border-primary/50 shadow-sm'
                        : 'bg-primary/20 text-foreground border-2 border-primary/50 shadow-sm'
                      : 'bg-primary text-primary-foreground border-2 border-primary shadow-sm'
                    : isZenMode
                    ? isDark
                      ? 'bg-white/10 text-white/70 hover:bg-white/15 border-2 border-white/30 shadow-sm'
                      : 'bg-card text-foreground/70 hover:bg-card/80 border-2 border-border/40 shadow-sm'
                    : 'bg-card text-foreground/70 hover:bg-card/80 border-2 border-border/40 shadow-sm'
                }`}
                style={{ fontWeight: 600 }}
              >
                {type === 'work-orders' ? 'Work Orders' : type === 'collaborative' ? 'Sub Work Order' : 'General Activities'}
              </button>
            ))}
          </div>

          {/* Search - Hide for General Activities and Search & Request */}
          {selectedType !== 'others' && !(selectedType === 'collaborative' && collaborativeTab === 'search') && !(selectedType === 'collaborative' && collaborativeTab === 'my-access') && (
            <div className="relative mb-3">
              <Search 
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isZenMode 
                    ? isDark 
                      ? 'text-white/40' 
                      : 'text-foreground/40'
                    : 'text-muted-foreground'
                }`} 
                strokeWidth={2} 
              />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${
                  isZenMode 
                    ? isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40'
                      : 'bg-black/5 border-black/10 text-foreground placeholder:text-foreground/40'
                    : 'bg-muted/30 border-0'
                }`}
              />
            </div>
          )}

          {/* Collaborative Tab Filters */}
          {selectedType === 'collaborative' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* View Selector Dropdown */}
              <div className="relative">
                <select
                  value={collaborativeTab}
                  onChange={(e) => setCollaborativeTab(e.target.value as 'my-access' | 'search')}
                  className={`w-full px-3 py-1.5 pr-8 rounded-lg text-xs appearance-none cursor-pointer transition-all ${
                    isZenMode 
                      ? isDark
                        ? 'bg-white/10 text-white/70 border-2 border-white/30 shadow-sm hover:bg-white/15'
                        : 'bg-card text-foreground/70 border-2 border-border/40 shadow-sm hover:bg-card/80'
                      : 'bg-card text-foreground/70 border-2 border-border/40 shadow-sm hover:bg-card/80'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  <option value="my-access">My Access</option>
                  <option value="search">Search & Request Access</option>
                </select>
                <ChevronDown 
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
                    isZenMode 
                      ? isDark 
                        ? 'text-white/60' 
                        : 'text-foreground/60'
                      : 'text-muted-foreground'
                  }`}
                  strokeWidth={2}
                />
              </div>

              {/* Search & Request Tab - Enhanced Search/Filter UI */}
              {collaborativeTab === 'search' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {/* Search Fields */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Search by WO Number (e.g., WO-2025-001)"
                      value={searchCollaborative}
                      onChange={(e) => setSearchCollaborative(e.target.value)}
                      className={`text-xs ${
                        isZenMode 
                          ? isDark
                            ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40'
                            : 'bg-black/5 border border-black/10 text-foreground placeholder:text-foreground/40'
                          : 'bg-muted/30 border-border'
                      }`}
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className={`w-full px-2 py-2 rounded-lg text-xs ${
                        isZenMode 
                          ? isDark
                            ? 'bg-white/10 border border-white/20 text-white'
                            : 'bg-black/5 border border-black/10 text-foreground'
                          : 'bg-muted/30 border border-border'
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="all">All Depts</option>
                      {uniqueDepartments.map((dept: string) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`w-full px-2 py-2 rounded-lg text-xs ${
                        isZenMode 
                          ? isDark
                            ? 'bg-white/10 border border-white/20 text-white'
                            : 'bg-black/5 border border-black/10 text-foreground'
                          : 'bg-muted/30 border border-border'
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="all">All Status</option>
                      {uniqueStatuses.map((status: string) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info Alert */}
                  <div className={`p-2 rounded-lg flex items-start gap-2 ${
                    isZenMode
                      ? isDark
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-primary/5 border border-primary/20'
                      : 'bg-primary/10 border border-primary/30'
                  }`}>
                    <Search className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                      Search and filter to find work orders, then click to request access
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Info Banners for Active/Pending tabs */}
              {collaborativeTab === 'my-access' && (
                <div className="flex items-center gap-2">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search 
                      className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${
                        isZenMode 
                          ? isDark 
                            ? 'text-white/40' 
                            : 'text-foreground/40'
                          : 'text-muted-foreground'
                      }`} 
                      strokeWidth={2} 
                    />
                    <input
                      type="text"
                      placeholder="Search work orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-2.5 pl-8 py-2.5 rounded-lg text-xs transition-all ${
                        isZenMode 
                          ? isDark
                            ? 'bg-white/10 text-white placeholder:text-white/40 border-2 border-white/30'
                            : 'bg-card text-foreground placeholder:text-foreground/40 border-2 border-border/40'
                          : 'bg-card text-foreground placeholder:text-muted-foreground border-2 border-border/40'
                      }`}
                      style={{ fontWeight: 500 }}
                    />
                  </div>
                  
                  {/* Sort Button */}
                  <div className="relative">
                    <select
                      value={accessSort}
                      onChange={(e) => setAccessSort(e.target.value as 'all' | 'active' | 'pending')}
                      className={`px-2.5 py-2.5 pr-7 rounded-lg text-xs appearance-none cursor-pointer transition-all ${
                        isZenMode 
                          ? isDark
                            ? 'bg-white/10 text-white/90 border-2 border-white/30 shadow-sm hover:bg-white/15'
                            : 'bg-card text-foreground border-2 border-border/40 shadow-sm hover:bg-card/80'
                          : 'bg-card text-foreground border-2 border-border/40 shadow-sm hover:bg-card/80'
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                    </select>
                    <ChevronDown 
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${
                        isZenMode 
                          ? isDark 
                            ? 'text-white/60' 
                            : 'text-foreground/60'
                          : 'text-muted-foreground'
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Work Order List */}
      <div className="flex-1 overflow-y-auto pb-6 safe-bottom">
        <div className="px-4 pt-4">
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isZenMode 
                  ? isDark ? 'bg-white/10' : 'bg-black/5'
                  : 'bg-muted/40'
              }`}>
                <Search className={`w-6 h-6 ${
                  isZenMode 
                    ? isDark ? 'text-white/60' : 'text-foreground/60'
                    : 'text-muted-foreground'
                }`} />
              </div>
              <p className={`text-sm ${
                isZenMode 
                  ? isDark ? 'text-white/60' : 'text-foreground/60'
                  : 'text-muted-foreground'
              }`}>No work orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((workOrder, index) => {
                // Get sub work order data for this work order (when in collaborative tab)
                const subWOData = selectedType === 'collaborative' ? getAccessStatus(workOrder) : null;
                
                return (
                <motion.div
                  key={workOrder.id}
                  onClick={(e) => handleWorkOrderClick(workOrder, subWOData, e)}
                  className={`w-full p-4 rounded-xl transition-all text-left cursor-pointer ${
                    isZenMode 
                      ? isDark
                        ? 'bg-white/[0.08] hover:bg-white/[0.12] border-2 border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl'
                        : 'bg-white/90 hover:bg-white border-2 border-black/15 hover:border-black/25 shadow-md hover:shadow-lg'
                      : 'bg-card hover:bg-card/80 border-2 border-border/60 hover:border-border shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    backdropFilter: isZenMode ? 'blur(12px)' : 'none',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {workOrder.type === 'others' ? (
                    // Simple card for "Others" section
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm mb-1 ${
                          isZenMode 
                            ? isDark ? 'text-white' : 'text-foreground'
                            : ''
                        }`} style={{ fontWeight: 600 }}>
                          {workOrder.number}
                        </p>
                        <p className={`text-xs ${
                          isZenMode 
                            ? isDark ? 'text-white/60' : 'text-foreground/60'
                            : 'text-muted-foreground'
                        }`}>
                          {workOrder.description}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${
                        isZenMode 
                          ? isDark ? 'text-white/60' : 'text-foreground/60'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-xs ${
                              isZenMode 
                                ? isDark ? 'text-white/60' : 'text-foreground/60'
                                : 'text-muted-foreground'
                            }`} style={{ fontWeight: 500 }}>
                              {subWOData ? subWOData.subWorkOrderNumber : workOrder.number}
                            </p>
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getPriorityColor(workOrder.priority) }}
                            />
                          </div>
                          <p className={`text-sm mb-1 ${
                            isZenMode 
                              ? isDark ? 'text-white' : 'text-foreground'
                              : ''
                          }`} style={{ fontWeight: 600 }}>
                            {subWOData ? subWOData.subWorkOrderName : workOrder.name}
                          </p>
                          <p className={`text-xs ${
                            isZenMode 
                              ? isDark ? 'text-white/60' : 'text-foreground/60'
                              : 'text-muted-foreground'
                          }`}>
                            {workOrder.client}
                          </p>
                          {/* Show reason for sub work order in collaborative tab */}
                          {subWOData && subWOData.reason && (
                            <p className={`text-xs mt-1.5 ${
                              isZenMode 
                                ? isDark ? 'text-white/50' : 'text-foreground/50'
                                : 'text-muted-foreground/80'
                            }`} style={{ fontWeight: 500, fontStyle: 'italic' }}>
                              Reason: {subWOData.reason}
                            </p>
                          )}
                        </div>
                        {/* Clickable Icon Button */}
                        {isOwner(workOrder) ? (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWorkOrderForAssignment(workOrder);
                              setCurrentScreen('owner-assign-sub-work-order');
                            }}
                            className="p-2 rounded-lg transition-all cursor-pointer hover:opacity-90"
                            style={{
                              background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                            }}
                          >
                            <Users className="w-4 h-4 text-white" strokeWidth={2} />
                          </div>
                        ) : subWOData && subWOData.status === 'active' ? (
                          // Eye icon for active sub work orders - navigates to detail view
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to my-sub-work-orders screen
                              // We'll need to add selectedSubWorkOrderId to context
                              setCurrentScreen('my-sub-work-orders');
                              toast.success('Opening sub work order details');
                            }}
                            className="p-2 rounded-lg transition-all cursor-pointer hover:opacity-90"
                            style={{
                              background: 'linear-gradient(135deg, #00C7B7 0%, #00E5D0 100%)',
                            }}
                          >
                            <Eye className="w-4 h-4 text-white" strokeWidth={2} />
                          </div>
                        ) : (
                          <div className={`p-2 rounded-lg transition-all ${
                            isZenMode 
                              ? isDark 
                                ? 'bg-white/10 hover:bg-white/15' 
                                : 'bg-black/5 hover:bg-black/10'
                              : 'bg-muted/30 hover:bg-muted/50'
                          }`}>
                            <svg className="block w-4 h-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                              <g>
                                <path 
                                  d={svgPaths.p38345c80} 
                                  stroke={isZenMode ? (isDark ? '#B3B4C0' : '#64748B') : '#B3B4C0'} 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="1.33278" 
                                />
                              </g>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge
                          className="text-[12px] px-2 py-0.5"
                          style={{
                            backgroundColor: workOrder.type === 'sequence' ? '#4B5CFB20' : '#00C7B720',
                            color: workOrder.type === 'sequence' ? '#4B5CFB' : '#00C7B7',
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          {workOrder.type === 'sequence' ? (
                            <div className="flex items-center gap-1">
                              <List className="w-2.5 h-2.5" />
                              <span>Sequence</span>
                            </div>
                          ) : (
                            'Direct'
                          )}
                        </Badge>
                        <Badge
                          className="text-[12px] px-2 py-0.5"
                          style={{
                            backgroundColor: `${getStatusColor(workOrder.status)}20`,
                            color: getStatusColor(workOrder.status),
                            fontWeight: 600,
                            border: 'none',
                          }}
                        >
                          {workOrder.status}
                        </Badge>
                        
                        {/* COLLABORATION: Only show owner/access badges for Collaborative tab */}
                        {selectedType === 'collaborative' && !isOwner(workOrder) && (() => {
                          const accessStatus = getAccessStatus(workOrder);
                          
                          return (
                            <>
                              {/* Show owner name for others' work orders */}
                              <Badge
                                className="text-[12px] px-2 py-0.5"
                                style={{
                                  backgroundColor: isDark ? '#F0BB0020' : '#F0BB0015',
                                  color: '#F0BB00',
                                  fontWeight: 600,
                                  border: 'none',
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <User className="w-2.5 h-2.5" />
                                  <span>{workOrder.ownerName}</span>
                                </div>
                              </Badge>
                              
                              {/* Access status badge - My Access shows active/pending only, Search shows all statuses */}
                              {collaborativeTab === 'my-access' ? (
                                // My Access tab: Show status of active or pending access only
                                <>
                                  {accessStatus?.status === 'active' && (
                                    <Badge
                                      className="text-[12px] px-2 py-0.5"
                                      style={{
                                        backgroundColor: isDark ? '#00C7B730' : '#00C7B720',
                                        color: '#00C7B7',
                                        fontWeight: 600,
                                        border: 'none',
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span>Active</span>
                                      </div>
                                    </Badge>
                                  )}
                                  {accessStatus?.status === 'pending' && (
                                    <Badge
                                      className="text-[12px] px-2 py-0.5"
                                      style={{
                                        backgroundColor: isDark ? '#F0BB0030' : '#F0BB0020',
                                        color: '#F0BB00',
                                        fontWeight: 600,
                                        border: 'none',
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        <span>Pending Approval</span>
                                      </div>
                                    </Badge>
                                  )}
                                  {accessStatus?.status === 'pending-approval' && (
                                    <Badge
                                      className="text-[12px] px-2 py-0.5"
                                      style={{
                                        backgroundColor: isDark ? '#FF4D4D30' : '#FF4D4D20',
                                        color: '#FF4D4D',
                                        fontWeight: 600,
                                        border: 'none',
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        <span>Deliverable Pending</span>
                                      </div>
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                // Search & Request tab: Only show "Request Access" since filtered to show only WOs without existing sub WOs
                                <Badge
                                  className="text-[12px] px-2 py-0.5"
                                  style={{
                                    backgroundColor: isDark ? '#94A3B830' : '#94A3B820',
                                    color: '#94A3B8',
                                    fontWeight: 600,
                                    border: 'none',
                                  }}
                                >
                                  <div className="flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Request Access</span>
                                  </div>
                                </Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Details */}
                      <div className={`grid gap-3 pt-3 border-t border-border/30 ${isOwner(workOrder) ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                          <div>
                            {/* COLLABORATION: Show access date for collaborative work orders with active access */}
                            {selectedType === 'collaborative' && !isOwner(workOrder) && getAccessStatus(workOrder)?.status === 'active' ? (
                              <>
                                <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                  Access Date
                                </p>
                                <p className="text-xs" style={{ fontWeight: 600 }}>
                                  {formatDate(getAccessStatus(workOrder)?.startDate || workOrder.dueDate)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                  Due Date
                                </p>
                                <p className="text-xs" style={{ fontWeight: 600 }}>
                                  {formatDate(workOrder.dueDate)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                          <div>
                            {/* COLLABORATION: Show access hours for collaborative work orders with active access */}
                            {selectedType === 'collaborative' && !isOwner(workOrder) && getAccessStatus(workOrder)?.status === 'active' ? (
                              <>
                                <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                  Access Given
                                </p>
                                <p className="text-xs" style={{ fontWeight: 600 }}>
                                  {(getAccessStatus(workOrder)?.allocatedMinutes || 0) / 60}h granted
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                  {isOwner(workOrder) ? 'TAT / Used' : 'Hours'}
                                </p>
                                <p className="text-xs" style={{ fontWeight: 600 }}>
                                  {workOrder.estimatedHours}h / {workOrder.actualHours}h
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Per Hour Rate - Third column for owned work orders */}
                        {isOwner(workOrder) && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] text-primary" style={{ fontWeight: 700 }}>₹</span>
                            </div>
                            <div>
                              <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>
                                Per Hour Rate
                              </p>
                              <p className="text-xs" style={{ fontWeight: 600 }}>
                                {workOrder.currency}{workOrder.rate}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Process Steps & Assign Button - Show for owned work orders */}
                      {isOwner(workOrder) && (() => {
                        // Calculate total allocated to sub work orders
                        const subWOsForThisWO = subWorkOrders.filter(
                          swo => swo.parentWorkOrderId === workOrder.number && 
                                 (swo.status === 'active' || swo.status === 'pending-approval' || swo.status === 'pending')
                        );

                        return (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            {/* Process Steps - Show only for sequence type */}
                            {workOrder.type === 'sequence' && workOrder.processSteps && workOrder.processSteps.length > 0 && (
                              <div className="mb-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedSteps({
                                      ...expandedSteps,
                                      [workOrder.number]: !expandedSteps[workOrder.number]
                                    });
                                  }}
                                  className={`w-full flex items-center justify-between mb-2 p-2 rounded-lg transition-all ${
                                    isZenMode
                                      ? isDark
                                        ? 'hover:bg-white/5'
                                        : 'hover:bg-black/5'
                                      : 'hover:bg-muted/30'
                                  }`}
                                >
                                  <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 600 }}>
                                    PROCESS STEPS ({workOrder.processSteps.length})
                                  </p>
                                  <ChevronDown 
                                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                                      expandedSteps[workOrder.number] ? 'rotate-180' : ''
                                    }`}
                                    strokeWidth={2}
                                  />
                                </button>
                                {expandedSteps[workOrder.number] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                  >
                                    {workOrder.processSteps.map((step: any) => (
                                      <div key={step.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                          step.status === 'Completed' ? 'bg-secondary' :
                                          step.status === 'In Progress' ? 'bg-primary' :
                                          'bg-muted-foreground/30'
                                        }`} />
                                        <p className="text-xs flex-1" style={{ fontWeight: 500 }}>
                                          {step.name}
                                        </p>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </div>
                            )}

                            {/* Sub Work Orders Count */}
                            {subWOsForThisWO.length > 0 && (
                              <p className="text-[10px] text-muted-foreground mb-2">
                                {subWOsForThisWO.length} active sub work order{subWOsForThisWO.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </motion.div>
              );
              })}
            </div>
          )}

        </div>
      </div>
      <BottomNav />
    </div>
  );
};