import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const APP_CONFIG = 'CONFIG';

export interface AppConfig {
  database: AppConfigDatabase;
}
export interface AppConfigDatabase {
  driver: 'postgres';
  url: string;
}

export const configProvider = {
  provide: APP_CONFIG,
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => {
    const driver = config.getOrThrow<string>('DATABASE_DRIVER');
    if (driver !== 'postgres') {
      throw new Error(`Unsupported database driver: ${driver}`);
    }

    const databaseUrl = new URL(config.getOrThrow<string>('DATABASE_URL'));
    databaseUrl.username = config.getOrThrow<string>('DATA_USERNAME');
    databaseUrl.password = config.getOrThrow<string>('DATA_PASSWORD');

    return {
      database: {
        driver,
        url: databaseUrl.toString(),
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
