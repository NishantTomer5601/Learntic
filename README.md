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
