import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';

import { AppConfig, AppConfigModule } from './app.config.provider';
import { OrderModule } from './order/order.module';
import { FilmsModule } from './films/films.module';
import { MongooseModule } from '@nestjs/mongoose';

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
    MongooseModule.forRootAsync({
      inject: ['CONFIG'],
      useFactory: (config: AppConfig) => ({ uri: config.database.url }),
    }),
    FilmsModule,
    OrderModule,
  ],
})
export class AppModule {}
