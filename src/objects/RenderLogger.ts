export class RenderLogger {
  private log: string[] = [];
  private errors = false;
  private warnings = false;

  public hasErrors(): boolean {
    return this.errors;
  }

  public hasWarnings(): boolean {
    return this.warnings;
  }

  public logMessage(message: string, messageType: string): void {
    this.log.push(message);

    this.errors = this.errors || messageType === "error";
    this.warnings = this.warnings || messageType === "warning";
  }

  public getMessages(): string {
    return this.log.length == 0 ? "" : this.log.join("\n\r");
  }

  public clearLog(): void {
    this.log = [];
  }
}
