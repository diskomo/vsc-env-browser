import * as vscode from "vscode";

class Logger {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Env Browser");
  }

  public log(message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    this.outputChannel.appendLine(formattedMessage);
    if (args.length > 0) {
      this.outputChannel.appendLine(`  ${JSON.stringify(args, null, 2)}`);
    }
    console.log(formattedMessage, ...args);
  }

  public error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ERROR: ${message}`;
    this.outputChannel.appendLine(formattedMessage);
    if (error) {
      if (error instanceof Error) {
        this.outputChannel.appendLine(`  ${error.message}`);
        this.outputChannel.appendLine(`  ${error.stack}`);
      } else {
        this.outputChannel.appendLine(`  ${String(error)}`);
      }
    }
    console.error(formattedMessage, error);
  }

  public show(): void {
    this.outputChannel.show(true);
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}

export const logger = new Logger();

