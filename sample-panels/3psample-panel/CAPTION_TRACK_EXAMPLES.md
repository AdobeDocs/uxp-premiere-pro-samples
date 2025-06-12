# Caption Track API Examples

This document describes the Caption Track API examples that have been added to the 3psample-panel.

## What Was Added

### New UI Components
Added a new "Caption Tracks" section in the HTML interface with four buttons:
- **Get Caption Track Count** - Shows how many caption tracks exist in the active sequence
- **Get Caption Track Info** - Displays detailed information about all caption tracks
- **Toggle Caption Track Mute** - Demonstrates muting/unmuting the first caption track
- **Get Caption Track Items** - Shows track items contained in caption tracks

### New API Functions

#### In `src/sequence.ts`:

1. **`getCaptionTrack(sequence, trackIndex)`**
   - Gets a specific caption track by index
   - Includes validation to ensure the index is within bounds

2. **`getCaptionTrackInfo(sequence)`**
   - Returns detailed information about all caption tracks including:
     - Track name and ID
     - Track index and mute status
     - Media type GUID

3. **`toggleCaptionTrackMute(sequence, trackIndex)`**
   - Toggles the mute state of a specified caption track
   - Provides user feedback about the operation success

4. **`getCaptionTrackItems(sequence)`**
   - Retrieves track items from all caption tracks
   - Shows both total items (including empty) and clip-only items
   - Demonstrates different ways to query track items

#### In `index.ts`:

Added corresponding click handler functions:
- `getCaptionTrackInfoClicked()`
- `toggleCaptionTrackMuteClicked()`
- `getCaptionTrackItemsClicked()`

## Caption Track APIs Demonstrated

The examples showcase the following Caption Track APIs that were previously unused:

### Core Caption Track APIs:
- `sequence.getCaptionTrackCount()` - Get number of caption tracks
- `sequence.getCaptionTrack(index)` - Get caption track by index
- `captionTrack.setMute(boolean)` - Set mute state
- `captionTrack.isMuted()` - Get mute state
- `captionTrack.getIndex()` - Get track index
- `captionTrack.getMediaType()` - Get media type GUID
- `captionTrack.getTrackItems(type, includeEmpty)` - Get track items
- `captionTrack.name` - Track name property
- `captionTrack.id` - Track ID property

### Usage Patterns:
- Error handling for missing sequences and tracks
- Iterating through multiple caption tracks
- Validating track indices before access
- Handling cases where no caption tracks exist
- User feedback through colored log messages

## How to Use

1. Open the 3psample-panel in Adobe Premiere Pro
2. Ensure you have an active project with a sequence
3. (Optional) Add caption tracks to your sequence for more interesting results
4. Use the Caption Track buttons in the panel to explore the APIs

## Benefits

This addition demonstrates:
- Complete Caption Track API coverage in the samples
- Best practices for error handling and validation
- User-friendly feedback patterns
- How to work with caption-specific track items
- Proper async/await usage with the APIs

The examples provide a foundation for developers to build caption-related functionality in their own Premiere Pro panels. 