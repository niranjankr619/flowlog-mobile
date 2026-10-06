/**
 * Meeting Detail Sheet
 * Shows comprehensive meeting information with different UI for completed vs upcoming meetings
 */

import { 
  Clock,
  ExternalLink,
  Copy,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';
import { useApp } from '../lib/AppContext';

interface ScheduledMeeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  source: 'google' | 'microsoft';
  attendees?: number;
  attendeeList?: string[]; //Full attendee names
  meetingLink?: string; // Meeting URL
  type: 'meeting' | 'call' | 'sync';
  status: 'scheduled' | 'auto-logged' | 'skipped';
  platform?: 'google-meet' | 'microsoft-teams' | 'zoom'; // Meeting platform
  description?: string; // Meeting description
}

interface MeetingDetailSheetProps {
  meeting: ScheduledMeeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeetingDetailSheet = ({ meeting, open, onOpenChange }: MeetingDetailSheetProps) => {
  if (!meeting) return null;

  const { theme } = useApp();
  const isCompleted = meeting.status === 'auto-logged';
  const duration = Math.floor((meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60));
  const [showAllAttendees, setShowAllAttendees] = useState(false);

  // Check if light theme
  const isLightTheme = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getPlatformName = () => {
    if (meeting.platform === 'google-meet') return 'Google Meet';
    if (meeting.platform === 'microsoft-teams') return 'Microsoft Teams';
    if (meeting.platform === 'zoom') return 'Zoom';
    return meeting.source === 'google' ? 'Google' : 'Microsoft';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showClose={false} className="h-[90vh] !bg-transparent border-t border-border/50 p-0">
        <div className="h-full glass-overlay rounded-t-[32px] border border-border/50 flex flex-col">
          <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/30">
            <SheetDescription className="sr-only">
              View meeting details including time, attendees, and meeting link
            </SheetDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <SheetTitle style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '18px' }}>
                  {meeting.title}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  {/* Status Badge */}
                  {isCompleted ? (
                    <Badge 
                      className="text-xs px-2 py-0.5" 
                      style={{
                        backgroundColor: isLightTheme ? '#8B5CF660' : '#8B5CF630',
                        color: isLightTheme ? '#6D28D9' : '#A78BFA',
                        fontWeight: 600,
                        border: isLightTheme ? '1px solid #8B5CF6' : '1px solid #8B5CF680'
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Auto-logged
                    </Badge>
                  ) : (
                    <Badge 
                      className="text-xs px-2 py-0.5" 
                      style={{
                        backgroundColor: isLightTheme ? '#EAB30860' : '#EAB30830',
                        color: isLightTheme ? '#A16207' : '#FACC15',
                        fontWeight: 600,
                        border: isLightTheme ? '1px solid #EAB308' : '1px solid #EAB30880'
                      }}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Scheduled
                    </Badge>
                  )}
                  
                  {/* Platform Badge */}
                  <Badge variant="outline" className="text-xs px-2 py-0.5" style={{ fontWeight: 600 }}>
                    {getPlatformName()}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Description */}
            {meeting.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>DESCRIPTION</p>
                <p 
                  className="text-sm p-3 rounded-lg bg-card/30 border border-border/30" 
                  style={{ 
                    fontWeight: 500,
                    ...(isLightTheme && {
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                    })
                  }}
                >
                  {meeting.description}
                </p>
              </div>
            )}

            {/* Time Information */}
            <div>
              <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>
                {isCompleted ? 'ACTUAL TIME' : 'SCHEDULED TIME'}
              </p>
              <div className="space-y-2">
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/30"
                  style={{
                    ...(isLightTheme && {
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                    })
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ 
                    background: isCompleted ? 'rgba(139, 92, 246, 0.2)' : 'rgba(234, 179, 8, 0.2)'
                  }}>
                    <Clock 
                      className="w-4 h-4" 
                      style={{ 
                        color: isLightTheme
                          ? (isCompleted ? '#6D28D9' : '#A16207')
                          : (isCompleted ? '#A78BFA' : '#FACC15')
                      }} 
                      strokeWidth={2} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ fontWeight: 600 }}>
                      {meeting.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {meeting.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                      {duration} minutes • {meeting.start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendees */}
            {meeting.attendeeList && meeting.attendeeList.length > 0 && (() => {
              const displayedAttendees = showAllAttendees 
                ? meeting.attendeeList 
                : meeting.attendeeList.slice(0, 5);
              const hasMore = meeting.attendeeList.length > 5;

              return (
                <div>
                  <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>
                    ATTENDEES ({meeting.attendeeList.length})
                  </p>
                  <div className="space-y-2">
                    {displayedAttendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-3 py-1.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ 
                          background: 'linear-gradient(135deg, #4B5CFB 0%, #00C7B7 100%)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}>
                          {attendee.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ fontWeight: 500 }}>
                            {attendee}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show More/Less Button */}
                    {hasMore && (
                      <button
                        onClick={() => setShowAllAttendees(!showAllAttendees)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-primary hover:text-primary/80 transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        {showAllAttendees ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Show {meeting.attendeeList.length - 5} More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Meeting Link */}
            {meeting.meetingLink && (
              <div>
                <p className="text-xs text-muted-foreground mb-3" style={{ fontWeight: 600 }}>MEETING LINK</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 p-3 rounded-lg bg-card/30 border border-border/30 truncate"
                    style={{
                      ...(isLightTheme && {
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                      })
                    }}
                  >
                    <p className="text-xs truncate" style={{ fontWeight: 500 }}>
                      {meeting.meetingLink}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(meeting.meetingLink!, 'Meeting link')}
                    className="shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(meeting.meetingLink, '_blank')}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isCompleted && (
            <div className="px-6 py-6 pt-4 glass-overlay border-t border-border/50 space-y-3 rounded-t-[24px]">
              <Button
                size="sm"
                onClick={() => {
                  toast.success('Meeting marked as complete');
                  onOpenChange(false);
                }}
                className="w-full text-xs"
                style={{ fontWeight: 600 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                Mark as Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info('Meeting skipped');
                  onOpenChange(false);
                }}
                className="w-full text-xs"
                style={{ fontWeight: 600 }}
              >
                Skip Meeting
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="px-6 py-6 pt-4 glass-overlay border-t border-border/50">
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full text-xs"
                style={{ fontWeight: 600 }}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};