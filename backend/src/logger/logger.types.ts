import { LogLevel } from '@nestjs/common';

export const LOGGER_FORMATS = ['dev', 'json', 'tskv'] as const;

export type LoggerFormat = (typeof LOGGER_FORMATS)[number];

export interface LogRecord {
  time: string;
  level: LogLevel;
  message: unknown;
  optionalParams: unknown[];
}

export function isLoggerFormat(value: string): value is LoggerFormat {
  return LOGGER_FORMATS.includes(value as LoggerFormat);
}
