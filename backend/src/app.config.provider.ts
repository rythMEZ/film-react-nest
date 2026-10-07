import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: AppConfigDatabase;
}
export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => ({
    database: {
      driver: config.get<string>('DATABASE_DRIVER'),
      url: config.get<string>('DATABASE_URL'),
    },
  }),
};

@Global()
@Module({
  providers: [configProvider],
  exports: ['CONFIG'],
})
export class AppConfigModule {}
