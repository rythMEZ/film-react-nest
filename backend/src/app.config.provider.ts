import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isLoggerFormat, LoggerFormat } from './logger/logger.types';

export const APP_CONFIG = 'CONFIG';

export interface AppConfig {
  database: AppConfigDatabase;
  logging: {
    format: LoggerFormat;
  };
}

export interface AppConfigDatabase {
  driver: 'postgres';
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}

export const configProvider = {
  provide: APP_CONFIG,
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => {
    const driver = config.getOrThrow<string>('DATABASE_DRIVER');
    if (driver !== 'postgres') {
      throw new Error(`Unsupported database driver: ${driver}`);
    }

    const loggerFormat = config.get<string>('LOG_FORMAT', 'dev');

    if (!isLoggerFormat(loggerFormat)) {
      throw new Error(`Неподдерживаемый формат логгера: ${loggerFormat}`);
    }

    return {
      database: {
        driver,
        host: config.getOrThrow<string>('DATABASE_HOST'),
        port: Number(config.getOrThrow<string>('DATABASE_PORT')),
        name: config.getOrThrow<string>('DATABASE_NAME'),
        username: config.getOrThrow<string>('DATA_USERNAME'),
        password: config.getOrThrow<string>('DATA_PASSWORD'),
      },
      logging: {
        format: loggerFormat,
      },
    };
  },
};

@Global()
@Module({
  providers: [configProvider],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
