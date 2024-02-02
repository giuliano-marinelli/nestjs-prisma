import { DynamicModule, Inject, Logger, Module, OnModuleInit, Provider } from '@nestjs/common';
import { PrismaModuleOptions } from './interfaces/prisma.interface';
import { PrismaService } from './prisma.service';

import { join } from 'path';

import Refract from '@nestjs!/refract';
import { PrismaSchema } from './schema-builder/prisma-schema.factory';

@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule implements OnModuleInit {
  private static readonly logger = new Logger(PrismaModule.name, {
    timestamp: true
  });

  private static consoleLog = console.log;
  private static filePath;
  private static localFilePath;

  constructor(@Inject('PRISMA_MODULE_OPTIONS') private options: Record<string, any>) {}

  static forRoot(options: Partial<PrismaModuleOptions>): DynamicModule {
    const providers = [
      {
        provide: 'PRISMA_MODULE_OPTIONS',
        useValue: options
      }
    ];

    return {
      module: PrismaModule,
      providers: providers,
      exports: providers
    };
  }

  async onModuleInit() {
    PrismaModule.filePath = this.options?.autoSchemaFile || join(process.cwd(), 'prisma/schema.prisma');

    // if filepath is on process.cwd() directory then make a string with relative path
    PrismaModule.localFilePath = PrismaModule.filePath.includes(process.cwd())
      ? PrismaModule.filePath.replace(process.cwd(), '').replaceAll('\\', '/')
      : PrismaModule.filePath;

    // console.log(PrismaSchema.blocks);

    // console.log(PrismaSchema.fields);

    // PrismaModule.preventLog();
    Refract({
      // Supply models/enums for generation
      schema: PrismaSchema.build(),
      // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource
      datasource: {
        provider: 'mongodb',
        url: 'env("DATABASE_URL")'
      },
      // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#generator
      generators: [
        // {
        //   provider: 'prisma-client-js',
        //   previewFeatures: ['referentialIntegrity'],
        //   engineType: 'library',
        //   binaryTargets: ['native']
        // }
      ],
      // Define output path for generated Prisma file
      output: PrismaModule.filePath
    }).then(() => {
      PrismaModule.restoreLog();

      PrismaModule.logger.log(`Generated {${PrismaModule.localFilePath}} file successfully`);
    });
  }

  static preventLog() {
    console.log = function () {};
  }

  static restoreLog() {
    console.log = PrismaModule.consoleLog;
  }
}
