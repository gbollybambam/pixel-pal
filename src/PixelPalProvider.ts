import * as vscode from "vscode";
import { getUri } from "./utilities/getUri";

export class PixelPalProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "pixel-pal.view";

  private readonly _extensionUri: vscode.Uri;
  // NEW: Store the view so we can send messages to it later
  private _view?: vscode.WebviewView;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    // NEW: Capture the view reference
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  // NEW: Public method to send messages to the frontend
  public sendMessage(type: string, value?: any) {
    if (this._view) {
      this._view.webview.postMessage({ type, value });
    }
  }

private _getHtmlForWebview(webview: vscode.Webview) {
    // 1. Get the Build Path

    // 2. Get the JS and CSS
    const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.js"]);
    
    // 3. CRITICAL: Create the URI for the sprites folder
    // This converts "c:/.../sprites" into a URL the webview is allowed to read
    const spritesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "sprites"]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; connect-src * ${webview.cspSource}; img-src * data: blob: vscode-resource: https:; media-src *;">
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Pixel Pal</title>
        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}">
            // 4. Pass the real path to React
            window.spriteRoot = "${spritesUri}"; 
          </script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}


export function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}