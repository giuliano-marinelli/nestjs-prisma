import { Datasource, Generator } from '@nestjs!/refract/dist/types';

export interface PrismaModuleOptions {
  autoSchemaFile?: string;
  datasource: Datasource;
  generators: Generator[];
  include?: string[];
}
