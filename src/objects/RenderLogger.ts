export class RenderLogger {
  private log: string[] = [];

  public logMessage(message: string): void {
    this.log.push(message);
  }

  public getMessages(): string {
    return this.log.length == 0 ? "" : this.log.join("\n\r");
  }

  public clearLog(): void {
    this.log = [];
  }
}
