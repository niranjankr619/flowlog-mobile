# FLOWLOG Integrations & Sub Work Order Documentation

## Table of Contents
1. [Sub Work Orders](#sub-work-orders)
2. [Integrations](#integrations)
3. [Auto-Meeting Logging](#auto-meeting-logging)
4. [Integration Setup Guides](#integration-setup-guides)

---

## Sub Work Orders

### Overview
Sub Work Orders allow team members to request and log time on work orders they don't own. This replaces the previous "Collaboration" concept with a more structured workflow that mirrors real-world delegation patterns.

### How It Works

#### 1. **Requesting Sub-WO Access**
When a team member needs to work on someone else's work order:

1. Navigate to **Work Order Selector**
2. Search for the target work order
3. Click **"Request Sub-WO Access"**
4. Fill out the request form:
   - Reason for access
   - Estimated hours
   - Expected completion date
5. Submit request

**What happens:**
- Notification sent to work order owner
- Request appears in owner's "Pending Approvals" tab
- Requester sees "Pending" status in their requests

#### 2. **Owner Approving Sub-WO Request**
The work order owner can:

1. Open **Notification Center** or **Sub Work Order Center**
2. Review pending requests in "Pending Sub-WOs" tab
3. See request details:
   - Who is requesting
   - Reason
   - Estimated hours
   - Timeline
4. Take action:
   - **Approve** - Grant access immediately
   - **Reject** - Deny with optional reason
   - **Approve with limits** - Set max hours/duration

**Auto-approval scenarios:**
- Same department members (configurable)
- Recurring collaborators
- Emergency work orders

#### 3. **Logging Time on Sub-WO**
Once approved:

1. Team member starts timer
2. Selects the sub-work-order
3. Logs time as normal
4. Time entry tagged with:
   - `isSubWorkOrder: true`
   - `loggedBy: [team member]`
   - `workOrderOwner: [original owner]`
   - `approvalRef: [approval ID]`

**Display:**
- Clear badge showing "Sub-WO for [Owner Name]"
- Different card styling (secondary color border)
- Owner name prominently displayed

#### 4. **Time Entry Approval**
Work order owner reviews logged time:

1. Navigate to **Sub Work Order Center** > "My Sub-WOs" tab
2. See all time logged by others on their WOs
3. Review entry details
4. Approve or reject individual entries:
   - Full approval
   - Partial approval (reduce hours)
   - Rejection with reason

**Business Rules:**
- Entries are locked 24 hours after logging
- Cannot modify approved entries
- Rejected time doesn't count toward WO totals
- Audit trail maintained for all actions

---

## Integrations

### Overview
FLOWLOG integrates with 5 major productivity platforms to:
1. Auto-log meeting time
2. Sync work orders bidirectionally
3. Streamline team collaboration
4. Reduce manual data entry

### Supported Integrations

#### 1. **Google Workspace** (Calendar + Meet)
- **Category:** Calendar & Meetings
- **Status:** Pre-connected in demo
- **Features:**
  - ✅ Auto-log Google Meet meetings
  - ✅ Sync Google Calendar events
  - ✅ Import meeting durations automatically
  - ✅ Detect work-related vs personal meetings
  - ✅ Show attendees and meeting details

#### 2. **Microsoft 365** (Outlook + Teams)
- **Category:** Calendar & Meetings
- **Features:**
  - ✅ Auto-log Microsoft Teams meetings
  - ✅ Sync Outlook Calendar
  - ✅ Import meeting durations
  - ✅ Work hours detection
  - ✅ Integration with Office 365 ecosystem

#### 3. **Zoom**
- **Category:** Communication
- **Features:**
  - ✅ Auto-log Zoom meetings
  - ✅ Track meeting attendance
  - ✅ Import meeting recording metadata
  - ✅ Participant tracking
  - ✅ Detect recurring meetings

#### 4. **Slack**
- **Category:** Communication
- **Features:**
  - ✅ Link work orders to Slack channels
  - ✅ Post time log summaries to channels
  - ✅ Team notifications for approvals
  - ✅ Status updates in Slack
  - ✅ Direct message integration

#### 5. **Jira / Linear**
- **Category:** Project Management
- **Features:**
  - ✅ Two-way work order sync
  - ✅ Import Jira/Linear tasks as work orders
  - ✅ Sync time logs back to issues
  - ✅ Status synchronization
  - ✅ Comment sync

---

## Auto-Meeting Logging

### How It Works

When calendar integrations are enabled, FLOWLOG automatically:

1. **Monitors your calendar** for scheduled meetings
2. **Detects meeting platforms** (Google Meet, Teams, Zoom)
3. **Creates time entries** when meetings occur
4. **Categorizes** as "Meeting" type
5. **Shows in calendar view** with proper attribution

### Meeting Detection Logic

```javascript
// Pseudo-code for meeting detection
if (calendarEvent.containsMeetingLink) {
  const platform = detectPlatform(event.meetingLink);
  const duration = event.endTime - event.startTime;
  
  // Auto-create time entry
  createTimeEntry({
    category: 'Meeting',
    description: event.title,
    duration: duration,
    startTime: event.startTime,
    endTime: event.endTime,
    source: 'auto-logged',
    platform: platform, // 'google-meet' | 'teams' | 'zoom'
    attendees: event.attendees,
    meetingLink: event.meetingLink
  });
}
```

### Meeting Categories

**Automatically categorized as:**
- **Work Order Meetings** - If meeting title contains WO number
- **General Meetings** - Client calls, standups, reviews
- **Internal Meetings** - Team sync, 1-on-1s
- **External Meetings** - Vendor calls, conferences

**User can:**
- Edit auto-logged entries within 24 hours
- Assign to specific work order
- Add notes
- Mark as billable/non-billable

### Calendar View Integration

Auto-logged meetings appear in calendar view with:
- 🎥 Meeting icon badge
- Platform indicator (Meet/Teams/Zoom)
- Full-width cards (no overlaps)
- Height proportional to duration (80px per hour)
- Attendee avatars

### Example Scenarios

#### Scenario 1: Daily Standup (Google Meet)
```
Event: "Daily Standup - Engineering"
Time: 9:00 AM - 9:30 AM (30 min)
Platform: Google Meet
Attendees: 8 team members

Auto-logged as:
- Category: Meeting
- Description: Daily Standup - Engineering  
- Duration: 30 min
- Tags: [standup, recurring, team]
```

#### Scenario 2: Client Review (Zoom)
```
Event: "WO-2025-001 Design Review with Client"
Time: 2:00 PM - 3:30 PM (90 min)
Platform: Zoom
Attendees: Client + 3 designers

Auto-logged as:
- Category: Meeting
- Work Order: WO-2025-001 (auto-detected from title)
- Description: Design Review with Client
- Duration: 90 min
- Billable: Yes (client meeting)
- Tags: [client, review, design]
```

#### Scenario 3: Microsoft Teams Call
```
Event: "Sprint Planning"
Time: 10:00 AM - 12:00 PM (120 min)
Platform: Microsoft Teams
Attendees: Full product team

Auto-logged as:
- Category: Meeting
- Description: Sprint Planning
- Duration: 120 min
- Tags: [planning, sprint, team]
```

---

## Integration Setup Guides

### Google Workspace Setup

#### Prerequisites
- Google Workspace account
- Admin consent for Calendar API access
- OAuth 2.0 credentials

#### Setup Steps

1. **Connect Integration**
   - Go to **Settings** > **Integrations**
   - Click **Google Workspace**
   - Click **Connect**

2. **OAuth Flow**
   - Redirected to Google Sign-In
   - Grant permissions:
     - Read calendar events
     - Read meeting details
     - Access Google Meet metadata
   - Click **Allow**

3. **Configuration**
   - Toggle **Auto-log meetings** ON
   - Select calendars to monitor:
     - ✅ Primary Calendar
     - ✅ Work Calendar
     - ⬜ Personal Calendar
   - Set meeting detection rules:
     - ✅ Only meetings with 2+ attendees
     - ✅ Only during work hours (9am-6pm)
     - ⬜ Include all-day events

4. **Sync Settings**
   - **Sync frequency:** Every 15 minutes
   - **Historical sync:** Last 7 days
   - **Future events:** Next 30 days

#### What Gets Synced

**FROM Google Calendar → FLOWLOG:**
- Meeting title
- Start/end time
- Duration
- Attendees
- Meeting link (Google Meet)
- Description/notes
- Recurrence pattern

**FROM FLOWLOG → Google Calendar:**
- Time entry notes (optional)
- Billable status (as calendar color)
- Work order reference

---

### Microsoft 365 Setup

#### Prerequisites
- Microsoft 365 account
- Outlook Calendar access
- Azure AD app registration

#### Setup Steps

1. **Connect Integration**
   - Go to **Settings** > **Integrations**
   - Click **Microsoft 365**
   - Click **Connect**

2. **Microsoft Sign-In**
   - Use work Microsoft account
   - Grant permissions:
     - Calendars.Read
     - OnlineMeetings.Read
     - User.Read
   - Administrator consent (if required)

3. **Calendar Selection**
   - Choose calendars to sync:
     - ✅ Main Calendar
     - ✅ Team Calendar
     - ⬜ Shared Calendars

4. **Teams Integration**
   - ✅ Auto-log Teams meetings
   - ✅ Include meeting chat links
   - ✅ Track meeting recordings
   - ⬜ Sync meeting notes

#### Advanced Settings
- **Work hours:** Mon-Fri, 9am-6pm
- **Time zone:** Auto-detect
- **Meeting threshold:** 2+ attendees
- **Auto-categorize:** By organizer

---

### Zoom Setup

#### Prerequisites
- Zoom Pro/Business account
- Account owner/admin access for OAuth

#### Setup Steps

1. **Connect Integration**
   - Go to **Settings** > **Integrations**
   - Click **Zoom**
   - Click **Connect**

2. **Zoom OAuth**
   - Sign in to Zoom
   - Authorize FLOWLOG app
   - Grant scopes:
     - meeting:read
     - user:read
     - recording:read

3. **Meeting Detection**
   - ✅ Track scheduled meetings
   - ✅ Include instant meetings
   - ✅ Detect recurring meetings
   - ✅ Import participant data

4. **Recording Integration**
   - ⬜ Link meeting recordings
   - ⬜ Sync recording metadata
   - ⬜ Auto-tag recorded meetings

#### What Gets Logged
- Meeting title/topic
- Actual start/end time (not scheduled)
- Duration (actual, not planned)
- Number of participants
- Recording availability

---

### Slack Setup

#### Prerequisites
- Slack workspace
- Workspace admin approval
- Channel management permissions

#### Setup Steps

1. **Connect Integration**
   - Go to **Settings** > **Integrations**
   - Click **Slack**
   - Click **Connect**

2. **Workspace Authorization**
   - Select Slack workspace
   - Grant permissions:
     - channels:read
     - chat:write
     - users:read
     - commands (slash commands)

3. **Channel Linking**
   - Link work orders to channels:
     - `#wo-2025-001-mobile-app`
     - `#wo-2025-002-payment-gateway`
   - Set posting preferences:
     - ✅ Daily summary
     - ⬜ Real-time updates
     - ✅ Approval notifications

4. **Slash Commands**
   ```
   /flowlog start WO-2025-001
   /flowlog stop
   /flowlog status
   /flowlog log 2h "Design work"
   ```

#### Notifications Sent to Slack
- New sub-work-order requests
- Approval/rejection updates
- Time entry submissions
- Daily/weekly summaries
- Milestone completions

---

### Jira / Linear Setup

#### Prerequisites
- Jira/Linear account with API access
- API token or OAuth credentials
- Project admin permissions

#### Setup Steps (Jira)

1. **Connect Integration**
   - Go to **Settings** > **Integrations**
   - Click **Jira / Linear**
   - Select **Jira**
   - Click **Connect**

2. **Authentication**
   - Enter Jira site URL: `yourcompany.atlassian.net`
   - Provide API token
   - Or use OAuth flow

3. **Project Mapping**
   - Map Jira projects to FLOWLOG:
     - `MOBILE` → Mobile App WOs
     - `WEB` → Web Development WOs
     - `DESIGN` → Design WOs

4. **Sync Configuration**
   - **Direction:** Bidirectional
   - **Sync fields:**
     - ✅ Status
     - ✅ Assignee
     - ✅ Time logged
     - ✅ Comments
     - ⬜ Attachments
   - **Create issues as WOs:** Yes
   - **Push time logs to Jira:** Yes

#### Setup Steps (Linear)

1. **Connect Integration**
   - Select **Linear**
   - Click **Connect**

2. **Linear OAuth**
   - Authorize FLOWLOG
   - Select workspace
   - Grant read/write access

3. **Team Mapping**
   - Map Linear teams to FLOWLOG:
     - Engineering → Development WOs
     - Design → Design WOs
     - Product → Planning WOs

4. **Workflow Sync**
   - Map statuses:
     - Linear "In Progress" → FLOWLOG "Active"
     - Linear "Done" → FLOWLOG "Completed"
     - Linear "Canceled" → FLOWLOG "Archived"

---

## Best Practices

### For Sub Work Orders

1. **Clear Approval Criteria**
   - Document what requires approval
   - Set auto-approval rules for trusted team members
   - Define maximum hours without additional approval

2. **Timely Reviews**
   - Review pending requests daily
   - Approve/reject within 24 hours
   - Provide rejection reasons for learning

3. **Accurate Time Logging**
   - Log time promptly (same day)
   - Add descriptive notes
   - Tag with relevant keywords

4. **Audit Trail**
   - Review approval history monthly
   - Check for patterns of rejections
   - Adjust approval workflows as needed

### For Integrations

1. **Calendar Management**
   - Keep calendar up-to-date
   - Use consistent meeting naming
   - Include WO numbers in meeting titles

2. **Meeting Hygiene**
   - Mark personal events as "Private"
   - Use proper calendar for work events
   - Add clear descriptions

3. **Regular Sync Checks**
   - Verify integrations weekly
   - Check for failed syncs
   - Update credentials as needed

4. **Data Privacy**
   - Review connected apps quarterly
   - Revoke unused integrations
   - Use appropriate calendar visibility

---

## Troubleshooting

### Sub Work Orders

**Issue:** Request not appearing
- Check internet connection
- Verify work order exists
- Confirm you don't already have access

**Issue:** Can't log time on approved sub-WO
- Check if approval is active
- Verify you selected correct WO
- Check if WO is archived

**Issue:** Entry rejected
- Review rejection reason
- Check against WO scope
- Discuss with owner

### Integrations

**Issue:** Meetings not auto-logging
- Verify integration is connected
- Check "Auto-log meetings" is ON
- Confirm calendar permissions
- Check meeting has 2+ attendees (if enabled)

**Issue:** Duplicate entries
- Check multiple calendars not syncing same events
- Disable auto-log on secondary calendar
- Manually delete duplicates

**Issue:** Wrong meeting duration
- Verify actual meeting length
- Check if meeting ended early/late
- Edit entry within 24 hours

**Issue:** Sync failing
- Reconnect integration
- Check API quotas
- Verify credentials valid

---

## FAQs

### Sub Work Orders

**Q: Can I request sub-WO access for archived work orders?**
A: No, only active work orders can have sub-WO requests.

**Q: What happens if my sub-WO access is revoked?**
A: Existing approved time entries remain, but you cannot log new time. You'll receive a notification.

**Q: Can I delegate my sub-WO to someone else?**
A: No, sub-WO access is non-transferable. The other person must request their own access.

**Q: How long does sub-WO access last?**
A: Indefinitely until manually revoked, or until the work order is completed/archived.

### Integrations

**Q: Are my calendar events stored in FLOWLOG?**
A: Only work-related meetings are stored. Personal events are filtered out.

**Q: Can I disconnect an integration?**
A: Yes, anytime. Go to Settings > Integrations > Select integration > Disconnect.

**Q: What happens to auto-logged entries if I disconnect?**
A: Existing entries remain. Future meetings won't be logged automatically.

**Q: Can I edit auto-logged meeting time?**
A: Yes, within 24 hours of the meeting. After that, entries are locked.

**Q: Do integrations work offline?**
A: No, integrations require internet connection. Entries will sync when online.

---

## Security & Privacy

### Data Protection
- All OAuth tokens encrypted at rest
- No passwords stored, only secure tokens
- Data synced over HTTPS only
- Compliance: GDPR, CCPA, SOC 2

### Permissions
- Request minimum necessary permissions
- Can revoke anytime
- Audit log of all access
- Regular security reviews

### Data Retention
- Calendar data: 90 days
- Meeting metadata: 1 year
- Time entries: Indefinitely (until manual deletion)
- Sync logs: 30 days

---

## Support

For integration issues or questions:
- **Email:** integrations@flowlog.io
- **Slack:** #integrations-support
- **Docs:** https://docs.flowlog.io/integrations
- **Status:** https://status.flowlog.io

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
