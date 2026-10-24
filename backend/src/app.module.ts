import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';

import { APP_CONFIG, AppConfig, AppConfigModule } from './app.config.provider';
import { OrderModule } from './order/order.module';
import { FilmsModule } from './films/films.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        type: config.database.driver,
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        username: config.database.username,
        password: config.database.password,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    FilmsModule,
    OrderModule,
  ],
})
export class AppModule {}
