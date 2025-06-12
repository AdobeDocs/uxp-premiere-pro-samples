# Premiere Pro UXP Sample Plugin

This is a new sample panel based on the original 3psample-panel, designed to demonstrate various UXP (Unified Extensibility Platform) capabilities within Adobe Premiere Pro.

## Features

This sample panel provides examples for:

- **Project Management**: Opening, saving, and managing Premiere Pro projects
- **Sequence Operations**: Creating, modifying, and working with sequences
- **Markers**: Adding and managing various types of markers
- **Project Panel**: Manipulating project items, bins, and media files
- **Metadata**: Reading and writing project and XMP metadata
- **Source Monitor**: Controlling playback and clip operations
- **Keyframes**: Managing keyframe animations and interpolation
- **Effects & Transitions**: Applying and removing effects and transitions
- **Properties**: Getting and setting sequence properties
- **Settings**: Managing project and application settings
- **Import/Export**: Importing media files and exporting sequences

## Installation

1. Copy this panel to your UXP plugins directory
2. Load the plugin in Premiere Pro
3. Access the panel from the Window menu

## Development

To build and develop this panel:

```bash
cd html
npm install
npm run build
```

## Structure

- `html/` - Main panel HTML, CSS, and TypeScript source
- `html/src/` - TypeScript source files for various functionality modules
- `html/manifest.json` - Panel configuration and metadata
- `html/index.html` - Main panel interface
- `html/index.ts` - Main TypeScript entry point

## Usage

The panel provides a console for viewing operation results and numerous buttons organized by functionality category. Each button demonstrates specific API calls and operations available through the Premiere Pro UXP API. 