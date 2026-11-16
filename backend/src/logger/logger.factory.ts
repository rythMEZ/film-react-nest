import { LoggerService } from '@nestjs/common';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { LoggerFormat } from './logger.types';
import { TskvLogger } from './tskv.logger';

export class LoggerFactory {
  static create(format: LoggerFormat): LoggerService {
    switch (format) {
      case 'dev':
        return new DevLogger();
      case 'json':
        return new JsonLogger();
      case 'tskv':
        return new TskvLogger();
      default:
        throw new Error(`Unsupported logger format: ${format}`);
    }
  }
}
