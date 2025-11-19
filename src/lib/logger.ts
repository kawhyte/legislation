type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = import.meta.env.DEV;

  private shouldLog(level: LogLevel): boolean {
    if (this.isDev) return true;
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args);
    }
  }
}

export const logger = new Logger();
