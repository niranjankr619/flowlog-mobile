/**
 * Integration Settings Component
 * 
 * Essential Integrations:
 * - Microsoft Graph Calendar + Teams Attendance
 * - Google Calendar + Meet Attendance
 * - Manual Timer (built-in)
 * 
 * Optional Integrations:
 * - Slack, GitHub, Zoom, QuickBooks/Zoho, Desktop Activity
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Video, 
  MessageSquare, 
  Github,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Settings2,
  Clock,
  Bell,
  Zap,
  DollarSign,
  Monitor,
  Users,
  Link2,
  MapPin
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { toast } from 'sonner@2.0.3';
import { BottomNav } from './BottomNav';

interface IntegrationSettings {
  autoLog?: boolean;
  syncFrequency?: '5min' | '15min' | '30min' | '1hour';
  notifications?: boolean;
  defaultWorkOrder?: string;
  billableByDefault?: boolean;
  privacyMode?: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconBg: string;
  category: 'essential' | 'optional';
  type: 'calendar' | 'communication' | 'development' | 'finance' | 'productivity';
  features: string[];
  connected: boolean;
  lastSync?: string;
  settings?: IntegrationSettings;
}

const mockIntegrations: Integration[] = [
  // ESSENTIAL INTEGRATIONS
  {
    id: 'microsoft-graph',
    name: 'Microsoft 365',
    description: 'Calendar + Teams attendance tracking',
    icon: Calendar,
    iconBg: '#0078D4',
    category: 'essential',
    type: 'calendar',
    features: [
      'Read Outlook/Office365 calendar events',
      'Fetch meeting schedules and metadata',
      'Teams join/leave timestamps',
      'Auto-correct scheduled vs actual time',
      'Multiple join session support'
    ],
    connected: false,
    settings: {
      autoLog: true,
      syncFrequency: '15min',
      notifications: true,
      defaultWorkOrder: '',
      billableByDefault: false
    }
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Calendar + Meet attendance tracking',
    icon: Calendar,
    iconBg: '#4285F4',
    category: 'essential',
    type: 'calendar',
    features: [
      'Read all Google Calendar events',
      'Pull meeting schedules and Meet links',
      'Fetch real attendance logs',
      'Detect actual meeting duration',
      'Multiple join/leave cycles support'
    ],
    connected: true,
    lastSync: '2 minutes ago',
    settings: {
      autoLog: true,
      syncFrequency: '15min',
      notifications: true,
      defaultWorkOrder: '',
      billableByDefault: false
    }
  },
  
  // OPTIONAL INTEGRATIONS
  {
    id: 'slack',
    name: 'Slack',
    description: 'Quick commands & status tracking',
    icon: MessageSquare,
    iconBg: '#E01E5A',
    category: 'optional',
    type: 'communication',
    features: [
      'Quick /log slash commands',
      'Detect active/away status',
      'Post meeting reminders',
      'Link WOs to channels',
      'Team notifications'
    ],
    connected: false,
    settings: {
      notifications: true,
      defaultWorkOrder: ''
    }
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Track coding sessions & commits',
    icon: Github,
    iconBg: '#181717',
    category: 'optional',
    type: 'development',
    features: [
      'Track coding sessions',
      'Time log commits and PRs',
      'Map repos to PLM processes',
      'Webhook-based automation',
      'Activity timeline integration'
    ],
    connected: false,
    settings: {
      autoLog: true,
      defaultWorkOrder: '',
      billableByDefault: true
    }
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Meeting attendance tracking',
    icon: Video,
    iconBg: '#2D8CFF',
    category: 'optional',
    type: 'communication',
    features: [
      'Participant join/leave tracking',
      'Actual meeting duration',
      'Webhook-based time logs',
      'Multiple session support',
      'Attendance reports'
    ],
    connected: false,
    settings: {
      autoLog: true,
      syncFrequency: '15min',
      notifications: true
    }
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks / Zoho',
    description: 'Billable hours & invoicing',
    icon: DollarSign,
    iconBg: '#2CA01C',
    category: 'optional',
    type: 'finance',
    features: [
      'Export billable hours',
      'Sync clients and projects',
      'Auto-generate invoice drafts',
      'Time-based billing reports',
      'Revenue tracking'
    ],
    connected: false,
    settings: {
      syncFrequency: '1hour',
      billableByDefault: true,
      defaultWorkOrder: ''
    }
  },
  {
    id: 'desktop-activity',
    name: 'Desktop Timeline',
    description: 'Windows + macOS activity tracking',
    icon: Monitor,
    iconBg: '#6B7280',
    category: 'optional',
    type: 'productivity',
    features: [
      'Local device activity timeline',
      'Idle detection',
      'App usage tracking (privacy-compliant)',
      'Auto-suggest time logs',
      'Smart categorization'
    ],
    connected: false,
    settings: {
      autoLog: false,
      privacyMode: true,
      notifications: true
    }
  }
];

export const IntegrationSettings = () => {
  const { setCurrentScreen } = useApp();
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(true);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const integration = integrations.find(i => i.id === integrationId);
    
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { 
            ...int, 
            connected: true,
            lastSync: 'Just now'
          }
        : int
    ));
    
    setIsConnecting(false);
    
    if (integration) {
      toast.success(`${integration.name} connected successfully`);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { 
            ...int, 
            connected: false,
            lastSync: undefined
          }
        : int
    ));
    
    if (integration) {
      toast.success(`${integration.name} disconnected`);
    }
  };

  const handleUpdateSetting = (integrationId: string, key: keyof IntegrationSettings, value: any) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId && int.settings
        ? { ...int, settings: { ...int.settings, [key]: value } }
        : int
    ));
  };

  const connectedCount = integrations.filter(i => i.connected).length;
  const essentialIntegrations = integrations.filter(i => i.category === 'essential');
  const optionalIntegrations = integrations.filter(i => i.category === 'optional');

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* Header */}
      <div className="sticky top-0 z-20 glass-overlay border-b border-border/30">
        <div className="px-4 py-4 safe-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('profile')}
              className="p-2 hover:bg-muted rounded-lg transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div>
              <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Integrations
              </h2>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                {connectedCount} connected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
        <div className="px-4 pt-6 max-w-md mx-auto space-y-8">
          
          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-card/50 border border-border/40 flex items-start gap-3 zen-shadow-md"
          >
            <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: 'rgba(75, 92, 251, 0.1)' }}>
              <Info className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 500, lineHeight: '1.5' }}>
                Connect calendar & productivity tools to auto-log meetings and track work time.
              </p>
            </div>
          </motion.div>

          {/* Essential Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs text-muted-foreground mb-3 px-1" style={{ fontWeight: 600 }}>
              ESSENTIAL
            </p>
            <div className="space-y-2">
              {essentialIntegrations.map((integration, idx) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  index={idx}
                  isConnecting={isConnecting}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onManage={() => setSelectedIntegration(integration)}
                />
              ))}
            </div>
          </motion.div>

          {/* Optional Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-muted-foreground mb-3 px-1" style={{ fontWeight: 600 }}>
              OPTIONAL
            </p>
            <div className="space-y-2">
              {optionalIntegrations.map((integration, idx) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  index={idx}
                  isConnecting={isConnecting}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onManage={() => setSelectedIntegration(integration)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Integration Detail Modal */}
      <AnimatePresence>
        {selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setSelectedIntegration(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 space-y-5 bg-background overflow-y-auto zen-shadow-lg"
              style={{
                maxHeight: '85vh',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom))'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedIntegration.iconBg }}
                >
                  <selectedIntegration.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base" style={{ fontWeight: 700 }}>
                      {selectedIntegration.name}
                    </h2>
                    {selectedIntegration.category === 'essential' && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-primary/15 text-primary" style={{ fontWeight: 600 }}>
                        Essential
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                    {selectedIntegration.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2.5">
                <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>
                  FEATURES
                </p>
                <div className="space-y-2">
                  {selectedIntegration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-xs text-foreground/80" style={{ fontWeight: 500, lineHeight: '1.4' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings (if connected) */}
              {selectedIntegration.connected && selectedIntegration.settings && (
                <div className="space-y-3 p-3.5 rounded-xl bg-card/50 border border-border/40 zen-shadow-md">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                    <span className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>SETTINGS</span>
                  </div>
                  
                  {/* Auto-log toggle */}
                  {selectedIntegration.settings.autoLog !== undefined && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>Auto-log meetings</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIntegration.settings.autoLog}
                        onChange={(e) => handleUpdateSetting(selectedIntegration.id, 'autoLog', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#4B5CFB' }}
                      />
                    </div>
                  )}

                  {/* Sync frequency */}
                  {selectedIntegration.settings.syncFrequency !== undefined && (
                    <div className="space-y-2 py-2 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <RefreshCw className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>Sync frequency</span>
                      </div>
                      <select
                        value={selectedIntegration.settings.syncFrequency}
                        onChange={(e) => handleUpdateSetting(selectedIntegration.id, 'syncFrequency', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border/40 text-xs"
                        style={{ fontWeight: 500 }}
                      >
                        <option value="5min">Every 5 minutes</option>
                        <option value="15min">Every 15 minutes</option>
                        <option value="30min">Every 30 minutes</option>
                        <option value="1hour">Every hour</option>
                      </select>
                    </div>
                  )}

                  {/* Notifications */}
                  {selectedIntegration.settings.notifications !== undefined && (
                    <div className="flex items-center justify-between py-2 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIntegration.settings.notifications}
                        onChange={(e) => handleUpdateSetting(selectedIntegration.id, 'notifications', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#4B5CFB' }}
                      />
                    </div>
                  )}

                  {/* Billable by default */}
                  {selectedIntegration.settings.billableByDefault !== undefined && (
                    <div className="flex items-center justify-between py-2 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>Billable by default</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIntegration.settings.billableByDefault}
                        onChange={(e) => handleUpdateSetting(selectedIntegration.id, 'billableByDefault', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#4B5CFB' }}
                      />
                    </div>
                  )}

                  {/* Privacy mode */}
                  {selectedIntegration.settings.privacyMode !== undefined && (
                    <div className="flex items-center justify-between py-2 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>Privacy mode</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIntegration.settings.privacyMode}
                        onChange={(e) => handleUpdateSetting(selectedIntegration.id, 'privacyMode', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#4B5CFB' }}
                      />
                    </div>
                  )}

                  {/* Default work order */}
                  {selectedIntegration.settings.defaultWorkOrder !== undefined && (
                    <div className="space-y-2 py-2 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 600 }}>Default work order</span>
                      </div>
                      <input
                        type="text"
                        value={selectedIntegration.settings.defaultWorkOrder}
                        onChange={(e) => handleUpdateSetting(selectedIntegration.id, 'defaultWorkOrder', e.target.value)}
                        placeholder="e.g., WO-2024-001"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border/40 text-xs placeholder:text-muted-foreground"
                        style={{ fontWeight: 500 }}
                      />
                    </div>
                  )}

                  {/* Last sync info */}
                  {selectedIntegration.lastSync && (
                    <div className="pt-2 border-t border-border/40 text-xs flex items-center gap-1.5 text-muted-foreground" style={{ fontWeight: 500 }}>
                      <RefreshCw className="w-3 h-3" strokeWidth={2} />
                      Last synced: {selectedIntegration.lastSync}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {selectedIntegration.connected && (
                  <motion.button
                    onClick={() => setSelectedIntegration(null)}
                    className="flex-1 py-3 rounded-xl text-xs border-2 border-border/40"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      fontWeight: 600
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Done
                  </motion.button>
                )}
                <motion.button
                  onClick={() => handleConnect(selectedIntegration.id)}
                  disabled={isConnecting}
                  className="flex-1 py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                  style={{
                    background: selectedIntegration.connected 
                      ? 'transparent' 
                      : 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                    color: selectedIntegration.connected ? '#FF4D4D' : '#FFFFFF',
                    fontWeight: 600,
                    border: selectedIntegration.connected ? '2px solid rgba(255, 77, 77, 0.4)' : 'none'
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                      Connecting...
                    </>
                  ) : selectedIntegration.connected ? (
                    <>
                      <XCircle className="w-4 h-4" strokeWidth={2} />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" strokeWidth={2} />
                      Connect
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

// Integration Card Component
const IntegrationCard = ({ 
  integration, 
  index,
  isConnecting,
  onConnect,
  onDisconnect,
  onManage,
}: { 
  integration: Integration;
  index: number;
  isConnecting: boolean;
  onConnect: (integrationId: string) => void;
  onDisconnect: (integrationId: string) => void;
  onManage: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-card border-2 border-border/40 zen-shadow-md"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: integration.iconBg }}
        >
          <integration.icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm" style={{ fontWeight: 600 }}>
              {integration.name}
            </h3>
            {integration.connected && (
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" strokeWidth={2.5} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 500 }}>
            {integration.description}
          </p>

          {/* Buttons */}
          {!integration.connected ? (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onConnect(integration.id);
              }}
              disabled={isConnecting}
              className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                color: '#FFFFFF',
                fontWeight: 600
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                  Connect
                </>
              )}
            </motion.button>
          ) : (
            <div className="flex gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onManage();
                }}
                className="flex-1 py-2.5 rounded-xl text-sm border-2 border-border/40 flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: 'transparent',
                  fontWeight: 600
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings2 className="w-3.5 h-3.5" strokeWidth={2} />
                Manage
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDisconnect(integration.id);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm border-2 flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: 'transparent',
                  color: '#FF4D4D',
                  borderColor: 'rgba(255, 77, 77, 0.4)',
                  fontWeight: 600
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Disconnect
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Last sync info (if connected) */}
      {integration.connected && integration.lastSync && (
        <div className="mt-3 pt-3 border-t border-border/40 text-xs flex items-center gap-1.5 text-muted-foreground" style={{ fontWeight: 500 }}>
          <RefreshCw className="w-3 h-3" strokeWidth={2} />
          Last synced: {integration.lastSync}
        </div>
      )}
    </motion.div>
  );
};