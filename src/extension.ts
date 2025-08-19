import * as vscode from 'vscode';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export function activate(context: vscode.ExtensionContext) {
  // Register main command
  const showCommand = vscode.commands.registerCommand('project-structure-graph.show', () => {
    ProjectStructurePanel.createOrShow(context.extensionUri, context);
  });

  // Register API key management commands
  const setApiKeyCommand = vscode.commands.registerCommand('project-structure-graph.setApiKey', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Google Gemini API Key',
      password: true,
      ignoreFocusOut: true
    });

    if (apiKey) {
      await context.secrets.store('gemini-api-key', apiKey);
      vscode.window.showInformationMessage('Gemini API Key saved successfully');
    }
  });

  const clearApiKeyCommand = vscode.commands.registerCommand('project-structure-graph.clearApiKey', async () => {
    await context.secrets.delete('gemini-api-key');
    vscode.window.showInformationMessage('Gemini API Key cleared');
  });

  context.subscriptions.push(showCommand, setApiKeyCommand, clearApiKeyCommand);
}

class ProjectStructurePanel {
  public static currentPanel: ProjectStructurePanel | undefined;
  public static readonly viewType = 'projectStructureGraph';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ProjectStructurePanel.currentPanel) {
      ProjectStructurePanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      ProjectStructurePanel.viewType,
      'Project Structure Graph',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
      }
    );

    ProjectStructurePanel.currentPanel = new ProjectStructurePanel(panel, extensionUri, context);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._context = context;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getHtmlForWebview();
    this._setWebviewMessageListener();

    // Load initial data
    this._loadProjectStructure();
  }

  private _getHtmlForWebview(): string {
    const webview = this._panel.webview;
    
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'index.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'index.css'));
    
    console.log('Script URI:', scriptUri.toString());
    console.log('Style URI:', styleUri.toString());
    
    const nonce = getNonce();

    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource};">
        <link href="${styleUri}" rel="stylesheet">
        <title>Project Structure Graph</title>
        <style>
          body { margin: 0; padding: 0; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          #root { height: 100vh; }
          .loading { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px; }
        </style>
      </head>
      <body>
        <div id="root">
          <div class="loading">Loading project structure...</div>
        </div>
        <script nonce="${nonce}">
          console.log('Webview HTML loaded');
          window.addEventListener('error', function(e) {
            console.error('Webview script error:', e.error, e.message, e.filename, e.lineno);
          });
          window.addEventListener('load', function() {
            console.log('Webview window loaded');
          });
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}">
          console.log('After React script should have loaded');
          setTimeout(() => {
            console.log('Root element contents after 1s:', document.getElementById('root').innerHTML);
          }, 1000);
        </script>
      </body>
      </html>`;
    
    console.log('Generated HTML:', html);
    return html;
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case 'open-file':
            try {
              const document = await vscode.workspace.openTextDocument(message.path);
              await vscode.window.showTextDocument(document);
            } catch (error) {
              vscode.window.showErrorMessage(`Failed to open file: ${error}`);
            }
            break;

          case 'get-summary':
            await this._generateFileSummary(message.path);
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  private async _loadProjectStructure() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    console.log('Scanning directory:', rootPath);
    const fileTree = await this._scanDirectory(rootPath);
    console.log('File tree generated:', JSON.stringify(fileTree, null, 2));
    
    this._panel.webview.postMessage({
      command: 'load-data',
      data: fileTree
    });
  }

  private async _scanDirectory(dirPath: string, relativePath: string = ''): Promise<FileNode[]> {
    const items: FileNode[] = [];
    
    try {
      const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
      
      for (const [name, type] of entries) {
        // Skip hidden files and common directories to ignore
        if (name.startsWith('.') || name === 'node_modules' || name === 'dist') {
          continue;
        }

        const fullPath = path.join(dirPath, name);
        const currentRelativePath = relativePath ? path.join(relativePath, name) : name;
        const id = currentRelativePath.replace(/[\\\/]/g, '-');

        const node: FileNode = {
          id,
          name,
          path: fullPath,
          type: type === vscode.FileType.Directory ? 'directory' : 'file'
        };

        if (type === vscode.FileType.Directory) {
          node.children = await this._scanDirectory(fullPath, currentRelativePath);
        }

        items.push(node);
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return items;
  }

  private async _generateFileSummary(filePath: string) {
    const apiKey = await this._context.secrets.get('gemini-api-key');
    
    if (!apiKey) {
      vscode.window.showErrorMessage('Gemini API Key not set. Use "Set Gemini API Key" command first.');
      return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating file summary...',
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 0 });

        // Read file content
        const fileUri = vscode.Uri.file(filePath);
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        const textContent = Buffer.from(fileContent).toString('utf8');

        progress.report({ increment: 30 });

        // Generate summary using Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `Please provide a concise summary of this file including its purpose, main functionality, and key components. Keep it under 200 words:\n\n${textContent}`;
        
        progress.report({ increment: 60 });

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        progress.report({ increment: 100 });

        // Send summary back to webview
        this._panel.webview.postMessage({
          command: 'show-summary',
          summary: summary
        });
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to generate summary: ${error}`);
    }
  }

  public dispose() {
    ProjectStructurePanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}
