import { DynamicModule, Inject, Logger, Module, OnModuleInit, Provider } from '@nestjs/common';
import { PrismaModuleOptions } from './interfaces/prisma.interface';
import { PrismaService } from './prisma.service';
import { PrismaSchema } from './schema-builder/prisma-schema.factory';
import codegen from '@nestjs!/refract/dist/codegen';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule implements OnModuleInit {
  private static readonly logger = new Logger(PrismaModule.name, {
    timestamp: true
  });

  private static consoleLog = console.log;
  private static filePath;
  private static localFilePath;
  private static localIncludePaths;

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

    // map include paths to relative paths in a key/value object
    PrismaModule.localIncludePaths = this.options.include?.reduce((acc, path) => {
      acc[path] = path.includes(process.cwd()) ? path.replace(process.cwd(), '').replaceAll('\\', '/') : path;
      return acc;
    }, {});

    PrismaModule.preventLog();
    let { schema } = codegen({
      schema: PrismaSchema.build(),
      datasource: this.options.datasource,
      generators: this.options.generators
      //   output: PrismaModule.filePath
    });

    // add included schemas from the config to the generated schema
    let isFirst = true;
    for (const include of this.options.include || []) {
      const content = await readFile(include, 'utf8');
      schema += (isFirst ? '\n' : '') + `\n// include {${PrismaModule.localIncludePaths[include]}}\n\n${content}`;
      isFirst = false;
    }

    // write the generated schema with included schemas to the file
    writeFile(PrismaModule.filePath, schema, 'utf8').then(() => {
      PrismaModule.restoreLog();
      PrismaModule.logger.log(`Generated {${PrismaModule.localFilePath}} file successfully`);
      if (this.options.include?.length) {
        PrismaModule.logger.log(
          `Included schemas: ${Object.values(PrismaModule.localIncludePaths)
            .map((path) => `{${path}}`)
            .join(', ')}`
        );
      }
    });
  }

  static preventLog() {
    console.log = function () {};
  }

  static restoreLog() {
    console.log = PrismaModule.consoleLog;
  }
}
