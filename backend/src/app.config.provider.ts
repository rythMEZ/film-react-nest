import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const APP_CONFIG = 'CONFIG';

export interface AppConfig {
  database: AppConfigDatabase;
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

    return {
      database: {
        driver,
        host: config.getOrThrow<string>('DATABASE_HOST'),
        port: Number(config.getOrThrow<string>('DATABASE_PORT')),
        name: config.getOrThrow<string>('DATABASE_NAME'),
        username: config.getOrThrow<string>('DATA_USERNAME'),
        password: config.getOrThrow<string>('DATA_PASSWORD'),
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
