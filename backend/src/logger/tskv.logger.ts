import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { LogRecord } from './logger.types';

@Injectable()
export class TskvLogger implements LoggerService {
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
    const record: LogRecord = {
      time: new Date().toISOString(),
      level,
      message,
      optionalParams,
    };
    const line = Object.entries(record)
      .map(([key, value]) => `${key}=${this.escape(this.serialize(value))}`)
      .join('\t');
    const stream =
      level === 'error' || level === 'fatal' || level === 'warn'
        ? process.stderr
        : process.stdout;

    stream.write(`${line}\n`);
  }

  private serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    const seen = new WeakSet<object>();

    try {
      return (
        JSON.stringify(value, (_key, currentValue: unknown) => {
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
        }) ?? String(value)
      );
    } catch {
      return String(value);
    }
  }

  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/=/g, '\\=');
  }
}
