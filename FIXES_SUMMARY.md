# Background Tab & Command Execution Fixes

## Problem Summary
When users ran the app in the background or interacted with UI elements during app/website generation, terminal commands would get stuck and fail to complete. This happened because browsers throttle stream reading operations when tabs are not active.

## Solutions Implemented

### 1. Command Timeout Protection (`app/utils/shell.ts`)
- Added **5-minute timeout** for overall command execution
- Added **30-second timeout** for individual stream read operations
- Commands that exceed these timeouts will now fail gracefully with clear error messages instead of hanging indefinitely

### 2. Background Tab Detection & Warnings (`app/utils/visibilityMonitor.ts`)
- Created a visibility monitor that tracks when the browser tab goes to background
- Displays a **persistent warning toast** when the tab is backgrounded during app generation
- Warning automatically dismisses when the tab becomes active again
- Users are now informed to keep the tab active during command execution

### 3. Better Error Handling
- Stream read operations now retry with small delays if they fail
- Previous command executions are properly cleaned up before starting new ones
- Better logging and error messages for debugging

### 4. Integrated Warning System (`app/root.tsx`)
- Visibility monitor is automatically initialized when the app starts
- Warnings are shown using the existing toast notification system
- No manual setup required from users

## How This Helps Users

### Before:
- ❌ Commands would hang indefinitely in background tabs
- ❌ UI interactions would cause terminal operations to freeze
- ❌ No feedback about what was wrong
- ❌ Users had to manually kill and restart the app

### After:
- ✅ Commands timeout gracefully after reasonable wait periods
- ✅ Users are warned to keep the tab active
- ✅ Clear error messages when timeouts occur
- ✅ Automatic recovery from stuck states
- ✅ Better overall reliability during app/website generation

## Technical Details

### Timeout Configuration:
- **COMMAND_TIMEOUT_MS**: 5 minutes (300,000ms) - Max time for entire command
- **STREAM_READ_TIMEOUT_MS**: 30 seconds (30,000ms) - Max time for stream read operation

### Browser Behavior:
Modern browsers throttle background tabs to save resources. This affects:
- setTimeout/setInterval timing
- Network requests
- Stream reading operations (WebContainer terminal output)

By detecting when tabs are backgrounded and adding timeouts, we ensure commands don't hang indefinitely.

## Recommendations for Best Experience
1. **Keep the tab active** during app/website generation
2. If you see the background tab warning, switch back to the tab
3. Avoid switching tabs frequently during long-running builds
4. If a command times out, the error message will guide you on next steps
