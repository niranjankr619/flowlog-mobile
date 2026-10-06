/**
 * FLOWLOG - ERP-integrated, gamified time-logging app for The Process ecosystem
 * 
 * Features:
 * - 🎨 Beautiful glassmorphic UI with Indigo→Aqua gradients
 * - ⏱️ Neumorphic timer with real-time tracking
 * - 🎮 Gamification: XP, levels, streaks, badges
 * - 📊 Analytics & insights with charts
 * - 📅 Timeline calendar view
 * - 🏢 Work order integration
 * - 🌓 Light/dark theme support
 * - ✨ Smooth animations with Motion (Framer Motion)
 * 
 * Architecture:
 * - React + TypeScript
 * - Tailwind CSS for styling
 * - Motion for animations
 * - Recharts for data visualization
 * - Context API for state management
 * - Mock data for frontend-only demo
 */

import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { AppProvider, useApp } from './lib/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { CreateAccount } from './components/CreateAccount';
import { ForgotPassword } from './components/ForgotPassword';
import { IconShowcase } from './components/IconShowcase';
import { TimerDashboard } from './components/TimerDashboard';
import { ActivitySelector } from './components/ActivitySelector';
import { CalendarView } from './components/CalendarView';
import { ReportsInsights } from './components/ReportsInsights';
import { Reports } from './components/Reports';
import { ProfileSettings } from './components/ProfileSettings';
import { MyProfile } from './components/MyProfile';
import { TimeEntries } from './components/TimeEntries';
import { TeamApprovals } from './components/TeamApprovals';
import { BillableReview } from './components/BillableReview';
import { MySubWorkOrders } from './components/MySubWorkOrders';
import { SubWorkOrderSurveillance } from './components/SubWorkOrderSurveillance';
import { FlowCalendar } from './components/FlowCalendar';
import { EditTimeEntry } from './components/EditTimeEntry';
import { WorkOrderSelector } from './components/WorkOrderSelector';
import { EntryDetails } from './components/EntryDetails';
import { EditProfile } from './components/EditProfile';
import { WorkDurationReminder } from './components/WorkDurationReminder';
import { FloatingTimerBar } from './components/FloatingTimerBar';
import { AllEntriesView } from './components/AllEntriesView';
import { SubWorkOrderRequest } from './components/SubWorkOrderRequest';
import { OwnerAssignSubWorkOrder } from './components/OwnerAssignSubWorkOrder';
import { NotificationCenter } from './components/NotificationCenter';
import { ActivityAudit } from './components/ActivityAudit';
import { TeamDashboard } from './components/TeamDashboard';
import { CollaborativeAnalytics } from './components/CollaborativeAnalytics';
import { IntegrationSettings } from './components/IntegrationSettings';

const AppContent = () => {
  const { currentScreen, showSplash, theme } = useApp();

  console.log('AppContent render:', { currentScreen, showSplash, theme });

  // Check if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {!showSplash && (
        <AnimatePresence mode="wait">
          {currentScreen === 'login' && <LoginScreen key="login" />}
          {currentScreen === 'create-account' && <CreateAccount key="create-account" />}
          {currentScreen === 'forgot-password' && <ForgotPassword key="forgot-password" />}
          {currentScreen === 'icon-showcase' && <IconShowcase key="icon-showcase" />}
          {currentScreen === 'home' && <TimerDashboard key="home" />}
          {currentScreen === 'dashboard' && <TimerDashboard key="dashboard" />}
          {currentScreen === 'timer' && <TimerDashboard key="timer" />}
          {currentScreen === 'activity-selector' && <ActivitySelector key="activity-selector" />}
          {currentScreen === 'work-order-selector' && <WorkOrderSelector key="work-order-selector" />}
          {currentScreen === 'calendar' && <CalendarView key="calendar" />}
          {currentScreen === 'reports' && <Reports key="reports" />}
          {currentScreen === 'reports-old' && <ReportsInsights key="reports-old" />}
          {currentScreen === 'profile' && <MyProfile key="profile" />}
          {currentScreen === 'edit-profile' && <EditProfile key="edit-profile" />}
          {currentScreen === 'profile-settings' && <ProfileSettings key="profile-settings" />}
          {currentScreen === 'time-entries' && <TimeEntries key="time-entries" />}
          {currentScreen === 'team-approvals' && <TeamApprovals key="team-approvals" />}
          {currentScreen === 'billable-review' && <BillableReview key="billable-review" />}
          {currentScreen === 'flow-calendar' && <FlowCalendar key="flow-calendar" />}

          {currentScreen === 'edit-time-entry' && <EditTimeEntry key="edit-time-entry" />}
          {currentScreen === 'entry-details' && <EntryDetails key="entry-details" />}
          {currentScreen === 'entry-detail' && <EntryDetails key="entry-detail" />}
          {currentScreen === 'all-entries' && <AllEntriesView key="all-entries" />}
          {currentScreen === 'access-request' && <SubWorkOrderRequest key="access-request" />}
          {currentScreen === 'owner-assign-sub-work-order' && <OwnerAssignSubWorkOrder key="owner-assign-sub-work-order" />}
          {currentScreen === 'my-sub-work-orders' && <MySubWorkOrders key="my-sub-work-orders" />}
          {currentScreen === 'sub-work-order-surveillance' && <SubWorkOrderSurveillance key="sub-work-order-surveillance" />}
          {currentScreen === 'notification-center' && <NotificationCenter key="notification-center" />}
          {currentScreen === 'workDurationReminder' && <WorkDurationReminder key="workDurationReminder" />}
          {currentScreen === 'activity-audit' && <ActivityAudit key="activity-audit" />}
          {currentScreen === 'team-dashboard' && <TeamDashboard key="team-dashboard" />}
          {currentScreen === 'collaborative-analytics' && <CollaborativeAnalytics key="collaborative-analytics" />}
          {currentScreen === 'integrations' && <IntegrationSettings key="integrations" />}
        </AnimatePresence>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: 'glass-overlay',
            title: 'text-base font-semibold',
            description: 'text-sm opacity-90',
            error: 'border-destructive/50 bg-destructive/10',
            success: 'border-primary/50 bg-primary/10',
            warning: 'border-yellow-500/50 bg-yellow-500/10',
            info: 'border-blue-500/50 bg-blue-500/10',
          },
          style: {
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'}`,
            background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 1)',
            backdropFilter: 'blur(20px)',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: isDarkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }}
      />

      {/* Floating Timer Bar - appears on all screens except timer dashboard */}
      <FloatingTimerBar />
    </>
  );
};

export default function App() {
  console.log('App component mounted');
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}