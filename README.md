# SupportFlow - Visual Builder

A visual decision tree editor for automating customer support conversations. Build, edit, and test chatbot flows with an intuitive node-based canvas interface.

## Overview

SupportFlow enables support teams to design complex conversational flows without coding. The system represents dialogue logic as connected nodes on a canvas, providing real-time editing and interactive preview modes.

## Features

- **Visual Flow Editor** - Drag-and-drop nodes on a spatial canvas
- **Smart Connectors** - SVG-based bezier curves connecting questions to responses
- **Real-time Editing** - Edit node text and options with instant visual feedback
- **Live Preview** - Test bot interactions before deployment
- **Guided Tour** - First-visit tooltips explain key controls and shortcuts
- **Minimap Navigation** - Viewport overview for large flows
- **Undo/Redo** - Full history management with Ctrl+Z / Ctrl+Shift+Z
- **Pan & Zoom** - Smooth canvas navigation with mouse wheel zoom
- **Node Management** - Add, delete, and reorganize nodes seamlessly

## Wildcard Feature (Innovation Clause)

**Minimap Overview.** Large decision trees become hard to navigate, and non-technical managers need fast spatial orientation. The minimap provides a bird's-eye view of the canvas so users can jump to distant regions and stay aware of overall structure. This reduces cognitive load, shortens onboarding, and cuts workflow errors.

## Additional Enhancements

- **Guided Tour** - First-visit tooltips explain key controls and shortcuts
- **Zoom Controls** - Quick zoom, fit, and mouse wheel navigation

## Architecture

The application is structured with strict separation of concerns:

```
data/                       Flow JSON data
src/                        Application source
|-- core/                   Business logic
|   |-- state.js            Flow state management and history
|   |-- canvas.js           Canvas transformation (pan/zoom)
|   `-- flow.js             Flow traversal and validation
|-- ui/                     Rendering layers
|   |-- renderer.js         Node DOM rendering
|   |-- connectors.js       SVG connector drawing
|   |-- panel.js            Edit panel interface
|   |-- tour.js             First-visit guided tour
|   |-- minimap.js          Canvas minimap visualization
|   `-- preview.js          Chat preview interface
|-- controllers/            Event handling and state mutations
|   |-- canvasController.js Pan, zoom, drag interactions
|   |-- nodeController.js   Node selection and interaction
|   `-- previewController.js Preview mode toggle
|-- styles/                 Modular CSS
|   |-- variables.css       Design tokens
|   |-- base.css            Global styles
|   |-- components.css      Component styles
|   `-- layout.css          Layout and containers
`-- main.js                 Application bootstrap
index.html                   App shell
README.md                    Project documentation
```

## Design File

Phase 1 deliverable (PDF export): **[Design File](https://drive.google.com/file/d/1iN6ohLyyEENizVc1bRX9JHB05Sq3cIZM/view?usp=sharing)**

## Design System

The interface uses a curated dark theme with cyan, purple, and green semantic colors:

- **Canvas**: Dark neutral space with grid background
- **Nodes**: Dark surfaces with colored accents by type
- **Interactions**: Smooth transitions and hover states
- **Typography**: Syne (UI) and DM Mono (code/labels)

## State Management

`FlowState` maintains immutable state with snapshot-based history:

- All mutations create snapshots automatically
- Undo/redo traverses history without recreation
- Nodes are cloned to prevent external mutations
- Selection state integrates with edit panel

## Custom Canvas System

Instead of using graph libraries, the canvas is built from first principles:

- **DOM-based nodes** with absolute positioning
- **Canvas/SVG hybrid** for connectors and minimap
- **Transform matrix** handles pan and zoom
- **Coordinate mapping** between screen and world space
- **Bezier curves** render smooth flow connections

## Preview Engine

The chat interface simulates live bot behavior:

- Traverses node graph following user selections
- Renders messages with animation frames
- Detects end nodes and loops back to start
- Maintains conversation history in memory

## Keyboard Shortcuts

- `Ctrl+Z` - Undo last change
- `Ctrl+Shift+Z` / `Ctrl+Y` - Redo
- `Esc` - Close edit panel and deselect

The first-visit tour calls these out so users do not miss them.

The guided tour calls these out on first visit so users discover them immediately.

## Data Format

Flows are defined in JSON with node-based structure:

```json
{
  "meta": { "theme": "dark", "canvas_size": { "w": 1200, "h": 800 } },
  "nodes": [
    {
      "id": "1",
      "type": "start|question|end",
      "text": "Question or response text",
      "position": { "x": 0, "y": 0 },
      "options": [{ "label": "Choice", "nextId": "2" }]
    }
  ]
}
```

## Development

### Setup

No build step required

```bash
Use VS Code Live Server (Alt+L, Alt+O)
```

### Module Organization

Each module exports a single class with focused responsibility:

- Input: Constructor parameters define dependencies
- Output: Public methods for interaction
- Side effects: Contained, tied to controller layer

### Testing the Flow

1. Open preview mode (click Preview button)
2. Navigate through questions by selecting options
3. View bot responses and conversation ending states
4. Click Restart to begin again

## Implementation Notes

### Performance Considerations

- Connectors are redrawn only when nodes change position
- Minimap uses canvas rendering layer (faster than DOM)
- Panel updates use event delegation
- Zoom transforms applied via CSS transform property

### DOM Coordinate Handling

Node positions are maintained in world space, not screen space:

- Pan/zoom changes only the transform matrix
- Dragging computes world coordinates from screen coordinates
- SVG lines calculate endpoints from node DOM elements

### History and Undo

Each state mutation creates a snapshot:

- `saveSnapshot()` is called after every change
- History index tracks position in timeline
- Redo is only possible if undo() was just called
- No branch merging; linear timeline maintained


## Future Enhancements

- Multi-user collaboration
- Flow export to JSON