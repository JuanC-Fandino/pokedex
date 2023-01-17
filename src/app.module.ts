import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
// Librería de las variables de entorno, no viene instalada por defecto
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.schema';

@Module({
  imports: [
    // El orden es importante, por eso debería ir siempre de primeras las variables de entorno
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot(process.env.MONGODB),
    PokemonModule,
    CommonModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
