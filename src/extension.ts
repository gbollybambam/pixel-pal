import * as vscode from 'vscode';
import { PixelPalProvider } from './PixelPalProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new PixelPalProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(PixelPalProvider.viewType, provider)
    );

    // 1. SMART TYPING DETECTOR
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.contentChanges.length === 0) return;

            // FIX: Get the WHOLE LINE where the user is typing
            const change = event.contentChanges[0];
            const range = change.range;
            const lineText = event.document.lineAt(range.start.line).text.toLowerCase();

            // CHECK 1: Magic Spell (Copilot)
            if (lineText.includes('copilot') || lineText.includes('ai')) {
                provider.sendMessage('status', 'copilot');
                // Optional: visual feedback
                vscode.window.setStatusBarMessage("Pixel Pal: AI Detected! 🧙‍♂️", 2000);
            } 
            // CHECK 2: Attack (Git Push)
            else if (lineText.includes('git push')) {
                provider.sendMessage('status', 'git-push');
                vscode.window.setStatusBarMessage("Pixel Pal: Pushing Code! ⚔️", 2000);
            }
            // CHECK 3: Just Running (Normal Typing)
            else {
                provider.sendMessage('status', 'typing');
            }
        })
    );

    // 2. SAVE DETECTOR (Jump)
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(() => {
            provider.sendMessage('status', 'save');
        })
    );

    // 3. ERROR DETECTOR (Hurt)
    context.subscriptions.push(
        vscode.languages.onDidChangeDiagnostics(() => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
                const hasErrors = diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Error);
                if (hasErrors) {
                    provider.sendMessage('status', 'error');
                }
            }
        })
    );
}

export function deactivate() {}