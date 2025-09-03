# Project Structure Graph

A VS Code extension that visualizes your project structure as an interactive graph with AI-powered file summaries using Google's Gemini API.

## Features

- 🌳 **Interactive Project Tree**: Visualize your project structure as an interactive graph using React Flow
- 🤖 **AI-Powered Summaries**: Get intelligent file summaries using Google's Gemini 2.0 Flash model
- 🔐 **Secure API Key Storage**: Safely store your Gemini API key using VS Code's SecretStorage
- 📁 **File Navigation**: Click on file nodes to open them directly in VS Code
- 🎨 **Clean UI**: Two-pane layout with graph visualization and detailed file information

## Prerequisites

- VS Code 1.103.0 or higher
- Node.js 20.19+ or 22.12+ (for development)
- Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installation

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   cd webview-ui && npm install
   ```
3. Build the project:
   ```bash
   npm run compile
   cd webview-ui && npm run build
   ```
4. Open in VS Code and press F5 to launch the extension in a new Extension Development Host

## Usage

### Setting up your API Key

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run `Set Gemini API Key`
3. Enter your Google Gemini API key

### Using the Extension

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run `Show Project Structure Graph`
3. Explore your project structure in the interactive graph
4. Click on file nodes to:
   - Open the file in VS Code
   - View file details in the right panel
5. Use the "Generate Summary" button to get AI-powered file summaries

### Commands

- `Show Project Structure Graph`: Opens the main extension interface
- `Set Gemini API Key`: Sets your Google Gemini API key
- `Clear Gemini API Key`: Removes the stored API key

## Architecture

The extension consists of two main parts:

### Extension Backend (`src/extension.ts`)
- **Command Registration**: Handles VS Code commands
- **WebviewPanel Management**: Creates and manages the webview
- **File System Operations**: Scans project directories
- **API Integration**: Interfaces with Google Gemini API
- **Security**: Manages API keys using VS Code SecretStorage

### React Frontend (`webview-ui/`)
- **Graph Visualization**: Uses React Flow for interactive project trees
- **State Management**: Handles file selection and summary display
- **Message Passing**: Communicates with the extension backend
- **UI Components**: Two-pane layout with graph and details panel

## Project Structure

```
├── src/
│   └── extension.ts          # Main extension logic
├── webview-ui/               # React application
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── DetailsPanel.tsx # File details and summary panel
│   │   ├── vscode.ts        # VS Code API utilities
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── utils.ts         # Utility functions
│   ├── vite.config.ts       # Vite build configuration
│   └── package.json         # React app dependencies
├── dist/                    # Built webview assets
├── package.json             # Extension manifest
└── README.md               # This file
```

## Development

### Building the Extension

```bash
# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

### Building the Webview

```bash
cd webview-ui

# Build for production
npm run build

# Development server
npm run dev
```

### Testing

Press F5 in VS Code to launch the Extension Development Host and test your changes.

## Configuration

The extension uses Vite with custom build configuration to:
- Output to `../dist` directory
- Generate static filenames for predictable asset loading
- Exclude the output directory from being cleared

## Security

- API keys are stored securely using VS Code's SecretStorage API
- Webview content security policy prevents unauthorized script execution
- All external resources use secure `vscode-resource:` URIs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### "Gemini API Key not set" Error
Make sure you've set your API key using the `Set Gemini API Key` command.

### Graph Not Loading
Ensure your workspace has a folder open and contains files to display.

### Build Errors
Make sure you have Node.js 20.19+ and all dependencies installed.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
________________


graph TD
    subgraph "Request Flow"
        direction TB
        A[👤 Client sends POST Request] --> B[Django Dev Server / WSGI];
        B --> C[Project URL Router <br/> watch_movie/urls.py];
        C -- /watch/... --> D[App URL Router <br/> watchlist_app/urls.py];
        D -- 'stream/&lt;pk&gt;/review-create' --> E[ReviewCreate View <br/> views.py];
        E -- Checks Permission --> F[IsAuthenticated <br/> DRF Permissions];
        E -- Uses Serializer for validation --> G[Review_serializer <br/> serializers.py];
        G -- Validates request data --> E;
        E -- On success, calls --> H[perform_create Method <br/> within ReviewCreate view];
        H -- Fetches movie --> I[Django ORM];
        I -- SELECT query --> J[WatchList Model <br/> models.py];
        J --> K[SQLite Database];
        K -- Returns movie data --> J;
        J --> I;
        I --> H;
        H -- Updates movie rating, calls serializer.save --> G;
        G -- Creates new review instance --> L[Review Model <br/> models.py];
        L -- INSERT query via ORM --> K;
    end

    subgraph "Response Flow"
        %% Connections are now defined from the source of the data to the destination, using -->
        K2[SQLite Database] --> L2[Review Model <br/> models.py];
        L2 -- New review data --> G2[Review_serializer <br/> serializers.py];
        G2 -- Serializes new review --> E2[ReviewCreate View <br/> views.py];
        E2 --> B2[Django Dev Server / WSGI];
        B2 --> A2[👤 Client receives 201 Response];
    end

    %% Styling and invisible links for layout
    linkStyle 16 stroke-width:2px,fill:none,stroke:green;
    linkStyle 17 stroke-width:2px,fill:none,stroke:green;
    linkStyle 18 stroke-width:2px,fill:none,stroke:green;
    linkStyle 19 stroke-width:2px,fill:none,stroke:green;
    linkStyle 20 stroke-width:2px,fill:none,stroke:green;


    K --> K2;
    style K fill:#fff,stroke:#fff,stroke-width:0px
    style K2 fill:#fff,stroke:#fff,stroke-width:0px
------------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({ startOnLoad: true });

const DagRenderer = ({ initialApiData }) => {
  // State to hold the entire graph object from your API
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // On initial load, set the graph data from the first API call
    if (initialApiData) {
      // IMPORTANT: Validate the incoming data first!
      const validatedData = validateApiResponse(initialApiData);
      setGraphData(validatedData);
    }
  }, [initialApiData]);

  useEffect(() => {
    // Whenever graphData changes, re-render the Mermaid diagram
    if (graphData) {
      mermaid.contentLoaded();
    }
  }, [graphData]);

  // The function to handle node expansion
  const handleNodeClick = async (nodeId) => {
    // ... (Implementation in the next step)
  };
  
  // Expose the click handler to the global scope so Mermaid can call it
  window.handleNodeClick = handleNodeClick;

  if (!graphData) {
    return <div>Loading graph...</div>;
  }

  return (
    <div>
      {/* The key is rendering the 'graphDefinition' from your state */}
      <div className="mermaid">
        {graphData.graphDefinition}
      </div>
    </div>
  );
};

----------------------------------------------------------------------

{
  "graphDefinition": "graph TD;\n    A[Monolith API]:::expandable --> B[Database];\n    A --> C{Message Queue};\n    D[Frontend App] --> A;\n\n    %% Styling and Clicks\n    classDef expandable fill:#89cff0,stroke:#333,stroke-width:2px,cursor:pointer;\n    click A call handleNodeClick(\"A\")",
  "nodes": {
    "A": {
      "is_expandable": true,
      "summary": "The main monolithic API handling all business logic.",
      "resource": "https://internal-docs/monolith-api"
    },
    "B": {
      "is_expandable": false,
      "summary": "PostgreSQL database for data persistence.",
      "resource": null
    }
  },
  "context": "A high-level view of the primary application architecture."
}

----------------------------------------------------------------------

const handleNodeClick = async (nodeId) => {
    const nodeMeta = graphData.nodes[nodeId];

    // 1. Check if the node is expandable
    if (nodeMeta && nodeMeta.is_expandable) {
      console.log(`Expanding node: ${nodeId}`);
      
      // Show a loading indicator if you want
      
      // 2. Prepare the payload for the expansion API
      const payload = {
        previousContext: graphData.context,
        currentGraph: graphData.graphDefinition,
        nodeToExpand: nodeId
      };
      
      // 3. Call your GPT API
      try {
        const response = await fetch('/api/expand-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const newGraphData = await response.json();
        
        // 4. Validate and update the state
        const validatedData = validateApiResponse(newGraphData);
        setGraphData(validatedData); // This triggers the re-render!

      } catch (error) {
        console.error("Failed to expand node:", error);
        // Handle error (e.g., show a toast notification)
      }

    } else {
      // 5. Handle non-expandable nodes (summarize, redirect, etc.)
      alert(`Summary for ${nodeId}: ${nodeMeta.summary}`);
      if (nodeMeta.resource) {
        window.open(nodeMeta.resource, '_blank');
      }
    }
  };

  // Remember to expose it to the window object for Mermaid
  window.handleNodeClick = handleNodeClick;

  ----------------------------------------------------------------------

  "You are an expert code architect. Below is the current Mermaid DAG representing a codebase. The user has clicked on the node with ID A ('Monolith API').

Current Context: A high-level view of the primary application architecture.
Current Graph:

Code snippet

graph TD;
   A[Monolith API] --> B[Database];
Now, expand only the A node into a detailed subgraph showing its internal components (e.g., 'Auth Service', 'User Service', 'Payment Gateway'). Integrate this new subgraph into the main graph, replacing the original A node. The new components should link to each other and to the existing B node where appropriate. Return the complete new Mermaid string and updated node metadata in the specified JSON format. Ensure all newly created nodes inside the subgraph are not expandable."

----------------------------------------------------------------

import { z } from 'zod';

const NodeMetadataSchema = z.object({
  is_expandable: z.boolean(),
  summary: z.string().optional().nullable(),
  resource: z.string().url().optional().nullable()
});

const ApiResponseSchema = z.object({
  graphDefinition: z.string().min(10), // Must be a reasonably long string
  nodes: z.record(NodeMetadataSchema), // An object where keys are strings and values match NodeMetadataSchema
  context: z.string().optional()
});

function validateApiResponse(data) {
  try {
    const validatedData = ApiResponseSchema.parse(data);
    // You could add further validation, like ensuring the Mermaid string is syntactically valid
    return validatedData;
  } catch (error) {
    console.error("API Response Validation Failed:", error);
    // Throw an error or return a default state to prevent app crashes
    throw new Error("Received invalid data from the server.");
  }
}

-------------------------------------------------------------------