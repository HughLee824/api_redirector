export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  static info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  static error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  static debug(message: string, meta?: any): void {
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logLevel === 'debug') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  static logRequest(method: string, url: string, apiKey?: string, status?: number): void {
    if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
      this.info('Request processed', {
        method,
        url,
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'none',
        status
      });
    }
  }
} 