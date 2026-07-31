/**
 * Logger — Structured application logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isProd = (import.meta as any).env?.PROD;

  log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };

    if (this.isProd) {
      this.sendToLoggingService(logEntry);
    } else {
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn :
                           level === 'info' ? console.info : console.debug;
      consoleMethod(`[${timestamp}] [${level.toUpperCase()}]`, message, data || '');
    }
  }

  debug(message: string, data?: any) { this.log('debug', message, data); }
  info(message: string, data?: any) { this.log('info', message, data); }
  warn(message: string, data?: any) { this.log('warn', message, data); }
  error(message: string, data?: any) { this.log('error', message, data); }

  private async sendToLoggingService(entry: any) {
    try {
      console.log(JSON.stringify(entry));
    } catch (e) {
      console.error('Failed to send log:', e);
    }
  }
}

export const logger = new Logger();