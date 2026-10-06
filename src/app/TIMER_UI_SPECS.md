# FLOWLOG Timer Page - UI Specifications

## Overview
The Timer page is the main interface for time tracking in FLOWLOG, featuring a sophisticated design with glassmorphism, gradient effects, and smooth animations following "Calm Power" and "Playful Utility" principles.

---

## 📐 Layout & Grid System

### 8-Point Grid System
- All spacing follows 8pt increments: 8px, 16px, 24px, 32px, 40px, 48px, etc.
- Consistent padding and margins throughout

### Device Specifications
- **Target Device**: iPhone 16 Plus
- **Screen Width**: 393px (with safe areas)
- **Container Padding**: 16px horizontal (left/right)
- **Vertical Safe Areas**: Applied to top and bottom

---

## 🎨 Color Palette

### Brand Colors

#### Primary - Indigo
- **HEX**: `#4B5CFB`
- **RGB**: `rgb(75, 92, 251)`
- **Usage**: Main action buttons, primary accents, work order badges
- **Variations**:
  - `rgba(75, 92, 251, 0.2)` - Subtle backgrounds
  - `rgba(75, 92, 251, 0.3)` - Borders
  - `rgba(75, 92, 251, 0.6)` - Hover states

#### Secondary - Aqua
- **HEX**: `#00C7B7`
- **RGB**: `rgb(0, 199, 183)`
- **Usage**: Success states, secondary actions, gradient accents
- **Variations**:
  - `rgba(0, 199, 183, 0.12)` - Particle effects
  - `rgba(0, 199, 183, 0.3)` - Selection backgrounds

#### Accent - Yellow/Gold
- **HEX**: `#F0BB00`
- **RGB**: `rgb(240, 187, 0)`
- **Usage**: "Others" activities, highlights, warnings
- **Variations**:
  - `rgba(240, 187, 0, 0.2)` - Badge backgrounds
  - `rgba(240, 187, 0, 0.3)` - Borders

#### Destructive - Red
- **HEX**: `#FF4D4D`
- **RGB**: `rgb(255, 77, 77)`
- **Usage**: Delete actions, error states

#### Success - Green
- **HEX**: `#00D68F` (light), `#00E0A1` (dark)
- **Usage**: Success notifications, positive actions

### Background Colors

#### Light Mode
- **Background**: `#F8F9FB` - Main app background
- **Foreground**: `#101213` - Primary text
- **Card**: `rgba(255, 255, 255, 0.8)` - Glass card backgrounds
- **Border**: `rgba(0, 0, 0, 0.08)` - Subtle borders

#### Dark Mode
- **Background**: `#0C0E14` - Main app background
- **Foreground**: `#F5F5F5` - Primary text
- **Card**: `rgba(255, 255, 255, 0.08)` - Glass card backgrounds
- **Border**: `rgba(255, 255, 255, 0.1)` - Borders
- **Zen Mode Background**: `#0F1117` - Deeper dark for Zen Mode

### Gradient
- **Primary Gradient**: `linear-gradient(135deg, #00C7B7 0%, #4B5CFB 100%)`
- **Zen Mode Radial**: Dynamic - changes hue based on elapsed time
  - Light: `radial-gradient(ellipse at 50% 50%, hsl(240+, 30%, 95%), hsl(200+, 25%, 97%), hsl(180, 20%, 98%))`
  - Dark: `radial-gradient(ellipse at 50% 50%, hsl(240+, 70%, 15%), hsl(200+, 60%, 10%), hsl(180, 50%, 8%))`

---

## 📝 Typography

### Font Families
- **Body Text**: `Inter` - All body copy, inputs, descriptions
- **Headings**: `Urbanist` - All headings (h1-h6), titles
- **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`

### Font Weights
- **Light**: `300` - Subtle hints, secondary info
- **Normal**: `400` - Body text, descriptions
- **Medium**: `500` - Labels, navigation
- **Semibold**: `600` - Section headings, emphasized text
- **Bold**: `700` - H1, H2, primary buttons

### Timer Display Specific

#### Main Timer (Normal Mode)
- **Font Size**: `80px` (5xl)
- **Font Weight**: `200` (Ultra Light)
- **Font Family**: `Inter`
- **Letter Spacing**: `-0.05em` (tight)
- **Format**: `00:00:00` (HH:MM:SS)
- **Color**: White (dark) / Foreground (light)

#### Zen Mode Timer
- **Font Size**: `48px` (5xl)
- **Font Weight**: `200` (Ultra Light)
- **Font Family**: `Inter`
- **Letter Spacing**: `-0.05em`
- **Inside**: 240px circle ring
- **Color**: White (dark) / Foreground (light)

#### Recent Entry Times
- **Font Size**: `12px` (xs)
- **Font Weight**: `500` (Medium)
- **Color**: `text-muted-foreground`
- **Format**: `9:30 AM - 10:15 AM`

### Text Sizes Reference
- **H1**: Default (Urbanist Bold, ~28-32px equivalent)
- **H2**: Default (Urbanist Semibold, ~24px equivalent)
- **H3**: Default (Urbanist Semibold, ~20px equivalent)
- **Body**: `16px` base (Inter Regular)
- **Small**: `14px` (sm)
- **Extra Small**: `12px` (xs)
- **Label**: `14px` (sm, Medium weight)
- **Button**: `16px` (base, Medium weight)

---

## 📦 Component Specifications

### Main Timer Card (Normal Mode)

#### Container
- **Padding**: `32px` (all sides)
- **Background**: 
  - Light: `rgba(255, 255, 255, 0.8)` with `backdrop-blur(20px)`
  - Dark: `rgba(255, 255, 255, 0.08)` with `backdrop-blur(20px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.1)` (dark) / `rgba(0, 0, 0, 0.08)` (light)
- **Border Radius**: `24px` (3xl)
- **Margin**: `16px` horizontal

#### Timer Display
- **Size**: `80px` height
- **Alignment**: Center
- **Mono Font**: Tabular nums for consistent width
- **Animation**: Updates every 1 second

#### Control Buttons Layout
- **Gap**: `12px` between buttons
- **Arrangement**: Horizontal flex row, centered

### Zen Mode Overlay

#### Full Screen Background
- **Z-Index**: `50`
- **Background**: Dynamic radial gradient (changes with time)
- **Animation**: Breathing effect when timer is running
  - **Duration**: 4 seconds
  - **Easing**: ease-in-out
  - **Scale**: 1 → 1.2 → 1
  - **Opacity**: 0.2 → 0.4 → 0.2

#### Timer Ring
- **Dimensions**: `240px × 240px`
- **Background**: `rgba(255, 255, 255, 0.1)` with `backdrop-blur-xl`
- **Border**: `2px solid rgba(75, 92, 251, 0.3)`
- **Border Radius**: `50%` (full circle)
- **Glow Effect**: 
  - **Outer Ring**: Conic gradient with blur(20px)
  - **Rotation**: 360° in 8 seconds (when running)
  - **Colors**: Indigo to Aqua gradient

#### Inner Pulse
- **Animation**: Breathing effect
  - **Scale**: 0.8 → 1.2 → 0.8
  - **Opacity**: 0.3 → 0 → 0.3
  - **Duration**: 2 seconds

### Buttons

#### Primary Action Button (Start/Stop)
- **Padding**: `16px × 24px` (py-4 px-6)
- **Border Radius**: `16px` (2xl)
- **Background**: 
  - Start: `rgba(75, 92, 251, 0.2)` with `backdrop-blur-xl`
  - Stop: `rgba(255, 255, 255, 0.1)` with `backdrop-blur-xl`
- **Border**: `1px solid rgba(75, 92, 251, 0.4)` / `rgba(255, 255, 255, 0.2)`
- **Font Weight**: `600` (Semibold)
- **Font Size**: `14px` (sm)
- **Icon Size**: `16px` (w-4 h-4)
- **Icon + Text Gap**: `8px`
- **Hover Scale**: `1.02`
- **Tap Scale**: `0.98`
- **Transition**: `200ms ease-out`

#### Secondary Button (Activity Selector)
- **Padding**: `12px × 16px`
- **Border Radius**: `12px` (xl)
- **Background**: `rgba(255, 255, 255, 0.1)` with `backdrop-blur-xl`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`
- **Icon Only**: Yes
- **Icon Size**: `20px` (w-5 h-5)
- **Hover Scale**: `1.05`
- **Tap Scale**: `0.95`

### Input Fields

#### Description Input
- **Width**: Full width
- **Padding**: `12px × 16px`
- **Border Radius**: `12px` (xl)
- **Background**: 
  - Dark: `rgba(255, 255, 255, 0.1)` with `backdrop-blur-xl`
  - Light: `rgba(0, 0, 0, 0.05)`
- **Border**: 
  - Default: `rgba(255, 255, 255, 0.2)` / `rgba(0, 0, 0, 0.1)`
  - Focus: `rgba(255, 255, 255, 0.4)` / `rgba(0, 0, 0, 0.2)`
- **Font Size**: `14px` (sm)
- **Font Weight**: `500` (Medium)
- **Placeholder**: 
  - Dark: `rgba(255, 255, 255, 0.4)`
  - Light: `text-muted-foreground`
- **Transition**: All properties 200ms

### Badges

#### Work Order Badge
- **Padding**: `4px × 8px`
- **Border Radius**: `8px`
- **Background**: `rgba(75, 92, 251, 0.2)` (dark) / `#4B5CFB28` (light)
- **Border**: `1px solid rgba(75, 92, 251, 0.3)` / `#4B5CFB40`
- **Font Size**: `12px` (xs)
- **Font Weight**: `600` (Semibold)
- **Color**: White (dark) / `#4B5CFB` (light)
- **Backdrop Blur**: Yes

#### Others Activity Badge
- **Background**: `rgba(240, 187, 0, 0.2)` / `#F0BB0028`
- **Border**: `1px solid rgba(240, 187, 0, 0.3)` / `#F0BB0040`
- **Color**: White (dark) / `#D4A100` (light)
- **Other specs same as Work Order Badge**

#### Billable Rate Badge
- **Format**: `$XX/hr` or `€XX/hr`
- **Style**: Same as Work Order Badge
- **Appears**: Next to work order badge when billable

### Recent Entries Cards

#### Entry Card Container
- **Padding**: `16px`
- **Border Radius**: `16px` (2xl)
- **Background**: Glass card (`rgba(255, 255, 255, 0.8)` / `0.08`)
- **Border**: `1px solid` border color
- **Gap**: `8px` between cards
- **Swipe Reveal**: Delete button slides from right

#### Card Layout
- **Top Row**: Date badge + Time range
- **Middle Row**: Description text
- **Bottom Row**: Duration + Client/Activity + Category badge

#### Time Display
- **Format**: `9:30 AM - 10:15 AM`
- **Font Size**: `12px` (xs)
- **Font Weight**: `500`
- **Color**: `text-muted-foreground`

#### Duration Display
- **Format**: `2h 15m` or `45m`
- **Font Size**: `14px` (sm)
- **Font Weight**: `600`
- **Color**: Primary text

#### Delete Button (Swipe Action)
- **Width**: `64px`
- **Background**: `#FF4D4D` (destructive)
- **Icon**: Trash2, white color
- **Reveals**: On left swipe
- **Threshold**: 50px swipe distance

### Filter System

#### Filter Chips
- **Padding**: `8px × 16px`
- **Border Radius**: `999px` (full)
- **Gap**: `8px` between chips
- **Font Size**: `14px` (sm)
- **Font Weight**: `500`

**Active State:**
- **Background**: `rgba(75, 92, 251, 0.15)`
- **Border**: `1px solid rgba(75, 92, 251, 0.3)`
- **Color**: Primary color

**Inactive State:**
- **Background**: `rgba(255, 255, 255, 0.05)`
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Color**: Muted foreground

### Bottom Navigation

#### Container
- **Height**: `80px` (includes safe area)
- **Background**: Glass overlay with stronger blur
- **Border Top**: `1px solid` border color
- **Position**: Fixed bottom
- **Z-Index**: `40`

#### Nav Items
- **Icon Size**: `24px` (w-6 h-6)
- **Label Size**: `12px` (xs)
- **Gap**: `4px` (icon to label)
- **Active Color**: Primary
- **Inactive Color**: Muted foreground
- **Active Scale**: `1.05`
- **Transition**: `200ms ease-out`

---

## 🎭 Animations & Transitions

### Standard Transitions
- **Duration**: `200ms`
- **Easing**: `ease-out`
- **Properties**: All transformations, colors, opacity

### Micro-Interactions

#### Button Press
- **Scale Down**: `0.95` - `0.98` depending on button size
- **Duration**: `100ms`
- **Easing**: `ease-out`

#### Button Hover
- **Scale Up**: `1.02` - `1.05` depending on button
- **Duration**: `200ms`
- **Easing**: `ease-out`

#### Card Entry Animation
- **Initial**: `opacity: 0, y: 20`
- **Animate**: `opacity: 1, y: 0`
- **Duration**: `300ms`
- **Easing**: `ease-out`

### Zen Mode Animations

#### Entry Animation
- **Overlay Fade**: 300ms
- **Timer Ring Scale**: From 0.9 to 1, 400ms
- **Controls Slide Up**: From y: 20, delay 500ms

#### Breathing Wave
- **Scale**: 1 → 1.2 → 1
- **Opacity**: 0.2 → 0.4 → 0.2
- **Duration**: 4 seconds
- **Repeat**: Infinite when timer running

#### Timer Ring Glow
- **Rotation**: 0° → 360°
- **Duration**: 8 seconds
- **Repeat**: Infinite when timer running
- **Opacity Pulse**: 0.4 → 0.7 → 0.4 (3s)

### Particle Effects (Timer Running)

#### Floating Particles
- **Count**: 25 particles
- **Size**: 3-11px diameter
- **Colors**: Primary (15%), Secondary (12%), Accent (8%) opacity
- **Movement**: Bottom to top with horizontal drift
- **Duration**: 15-25 seconds per cycle
- **Blur**: 2px
- **Glow**: Box shadow with particle color

#### Organic Wisps
- **Count**: 8 wisps
- **Size**: 80-180px width, 120-270px height
- **Colors**: Gradient from color to transparent
- **Movement**: Rising with rotation and morphing
- **Duration**: 12-20 seconds
- **Blur**: 30px
- **Border Radius**: Morphing between 40-60%

#### Shimmer Stars
- **Count**: 12 stars
- **Size**: 2px
- **Animation**: Fade in, scale up, fade out
- **Duration**: 3 seconds
- **Repeat Delay**: 7 seconds

---

## 📱 Gesture Interactions

### Touch Gestures

#### Timer Double Tap
- **Action**: Toggle Zen Mode
- **Threshold**: < 300ms between taps
- **Fallback**: Single tap = start/pause timer (after 300ms delay)

#### Two-Finger Swipe Down
- **Action**: Enter Zen Mode
- **Threshold**: > 80px vertical distance, < 50px horizontal
- **Duration**: < 500ms
- **Condition**: Timer must be running

#### Two-Finger Swipe Up
- **Action**: Exit Zen Mode
- **Threshold**: < -80px vertical distance
- **Duration**: < 500ms
- **Condition**: Must be in Zen Mode

#### Entry Card Swipe Left
- **Action**: Reveal delete button
- **Threshold**: > 50px left distance
- **Button Width**: 64px
- **Auto-close**: Tap outside or swipe right

#### Entry Card Long Press
- **Action**: Open quick edit modal
- **Duration**: 500ms hold
- **Feedback**: Haptic vibration (if supported)

### Tap Targets
- **Minimum Size**: 44×44px (iOS guideline)
- **Padding**: Additional padding around small icons
- **Spacing**: 8px minimum between tappable elements

---

## 🔊 Sound Effects

### Audio Specifications
- **Engine**: Web Audio API
- **Format**: Procedurally generated
- **Volume**: User-controllable via settings

### Sound Events

#### Timer Start
- **Type**: Ascending chirp
- **Frequencies**: 400Hz → 600Hz
- **Duration**: 150ms
- **Volume**: 0.15

#### Timer Pause
- **Type**: Short beep
- **Frequency**: 440Hz
- **Duration**: 100ms
- **Volume**: 0.12

#### Timer Resume
- **Type**: Quick ascending tone
- **Frequencies**: 440Hz → 520Hz
- **Duration**: 120ms
- **Volume**: 0.13

#### Timer Stop/Save
- **Type**: Descending chirp with success tone
- **Frequencies**: 600Hz → 400Hz, then 523Hz + 659Hz (chord)
- **Duration**: 200ms
- **Volume**: 0.15

#### Milestone (Hourly)
- **Type**: Celebration chime sequence
- **Frequencies**: 523Hz, 659Hz, 784Hz (C-E-G chord)
- **Duration**: 300ms total
- **Volume**: 0.18

#### UI Click/Tap
- **Type**: Short click
- **Frequency**: 880Hz
- **Duration**: 30ms
- **Volume**: 0.08

#### Selection/Reload
- **Type**: Soft pop
- **Frequency**: 660Hz
- **Duration**: 60ms
- **Volume**: 0.1

#### Zen Mode Enter
- **Type**: Calming chime cascade
- **Duration**: 600ms
- **Volume**: 0.15

#### Zen Mode Exit
- **Type**: Reverse chime cascade
- **Duration**: 400ms
- **Volume**: 0.12

### Zen Mode Music
- **Type**: Procedural generative ambient music
- **Scale**: C Pentatonic (C, D, E, G, A)
- **Layers**: 
  - Continuous pad drones (3 notes)
  - Melodic loop (30 seconds)
  - Harmonic layer
- **Volume**: 0.2 (master)
- **Reverb**: 3.5 second tail
- **Toggle**: Tap music button or tap Zen background

---

## 🌓 Light/Dark Mode

### Theme Detection
- **Method**: CSS custom properties + React context
- **Default**: System preference
- **Override**: User setting in profile
- **Detection**: `window.matchMedia('(prefers-color-scheme: dark)')`

### Contrast Requirements
- **Standard**: WCAG AA minimum (4.5:1 for normal text)
- **Large Text**: 3:1 ratio
- **Interactive Elements**: 3:1 against background
- **Original Colors**: Maintained (no desaturation)

### Dark Mode Adjustments
- **Glass Backgrounds**: Lower white opacity (0.08 vs 0.8)
- **Shadows**: Darker, more prominent
- **Borders**: Higher white opacity for visibility
- **Text**: Higher contrast (F5F5F5 vs 101213)
- **Particle Opacity**: Slightly reduced for comfort

---

## 📐 Spacing System (8pt Grid)

### Margin/Padding Scale
- `0` = 0px
- `1` = 8px
- `2` = 16px
- `3` = 24px
- `4` = 32px
- `5` = 40px
- `6` = 48px
- `8` = 64px
- `10` = 80px
- `12` = 96px
- `16` = 128px

### Component Spacing Usage

#### Timer Card
- **Padding**: 32px (4)
- **Margin Bottom**: 16px (2)

#### Button Padding
- **Primary**: 16px × 24px (py-4 px-6)
- **Secondary**: 12px × 16px (py-3 px-4)
- **Icon Only**: 12px (3)

#### Card Padding
- **Recent Entries**: 16px (4)
- **Entry Details**: 24px (3)

#### Section Gaps
- **Between Cards**: 8px (1)
- **Between Sections**: 24px (3)
- **Between Form Elements**: 16px (2)

---

## 🎯 Accessibility

### Keyboard Navigation
- **Not applicable** - Mobile-first iOS app
- **Touch targets**: Minimum 44×44px

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: On icon-only buttons
- **Live Regions**: Timer updates announced

### Motion Preferences
- **Respect**: `prefers-reduced-motion`
- **Fallback**: Simplified animations or instant state changes

### Color Accessibility
- **Contrast Ratios**: All text meets WCAG AA
- **Not Color-Only**: Icons + text labels where critical
- **High Contrast**: Available in settings

---

## 💾 State Management

### Timer States
1. **Idle** - `displayTime: 0`, `isRunning: false`
2. **Running** - `isRunning: true`, incrementing time
3. **Paused** - `displayTime > 0`, `isRunning: false`
4. **Zen Mode** - Overlay active, full screen

### Persistent Data
- **Storage**: React Context + localStorage
- **Recent Entries**: Array of entry objects
- **Timer State**: Current timer configuration
- **User Preferences**: Theme, sound settings

---

## 🔄 Performance Considerations

### Animation Performance
- **GPU Acceleration**: Transform and opacity properties
- **Will-Change**: Applied to animated elements
- **Debouncing**: Input field updates
- **RequestAnimationFrame**: For smooth particle animations

### Rendering Optimization
- **Conditional Rendering**: Particles only when timer running
- **Memo**: Static components memoized
- **Lazy Loading**: Heavy components loaded on demand

---

## 📊 Summary Table

| Element | Font Size | Font Weight | Color (Dark) | Spacing |
|---------|-----------|-------------|--------------|---------|
| Timer Display (Normal) | 80px | 200 | White | - |
| Timer Display (Zen) | 48px | 200 | White | - |
| Button Text | 14px | 600 | White | 16×24px padding |
| Description Input | 14px | 500 | White/60% | 12×16px padding |
| Badge | 12px | 600 | Primary/White | 4×8px padding |
| Entry Time | 12px | 500 | Muted | - |
| Entry Duration | 14px | 600 | Foreground | - |

---

## 🎨 Brand Color Reference Card

```
PRIMARY INDIGO     #4B5CFB  rgb(75, 92, 251)
SECONDARY AQUA     #00C7B7  rgb(0, 199, 183)
ACCENT YELLOW      #F0BB00  rgb(240, 187, 0)
DESTRUCTIVE RED    #FF4D4D  rgb(255, 77, 77)
SUCCESS GREEN      #00D68F  rgb(0, 214, 143) / #00E0A1 (dark)

BACKGROUND LIGHT   #F8F9FB  rgb(248, 249, 251)
BACKGROUND DARK    #0C0E14  rgb(12, 14, 20)
FOREGROUND LIGHT   #101213  rgb(16, 18, 19)
FOREGROUND DARK    #F5F5F5  rgb(245, 245, 245)
```

---

## 📱 Export Formats

This specification document is available in:
- **Markdown** (.md) - This file
- **Design Tokens** - CSS custom properties in `/styles/globals.css`
- **Component Code** - `/components/TimerDashboard.tsx`

---

**Last Updated**: November 7, 2025  
**Version**: 1.0  
**Platform**: iOS (iPhone 16 Plus)  
**Framework**: React + Tailwind CSS v4.0
