import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    this.write('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.write('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.write('fatal', message, optionalParams);
  }

  private write(level: LogLevel, message: any, optionalParams: any[]) {
    const line = this.serialize({ level, message, optionalParams });
    const stream =
      level === 'error' || level === 'fatal' || level === 'warn'
        ? process.stderr
        : process.stdout;

    stream.write(`${line}\n`);
  }

  private serialize(record: {
    level: LogLevel;
    message: unknown;
    optionalParams: unknown[];
  }): string {
    const seen = new WeakSet<object>();

    try {
      return JSON.stringify(record, (_key, currentValue: unknown) => {
        if (typeof currentValue === 'bigint') {
          return currentValue.toString();
        }

        if (currentValue instanceof Error) {
          return {
            name: currentValue.name,
            message: currentValue.message,
            stack: currentValue.stack,
          };
        }

        if (typeof currentValue === 'object' && currentValue !== null) {
          if (seen.has(currentValue)) {
            return '[Circular]';
          }
          seen.add(currentValue);
        }

        return currentValue;
      });
    } catch {
      return JSON.stringify({
        level: record.level,
        message: String(record.message),
        optionalParams: record.optionalParams.map(String),
      });
    }
  }
}
