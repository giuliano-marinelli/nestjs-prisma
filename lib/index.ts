import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';
import { PrismaSchema } from './builder/prisma-schema.factory';

import { Model } from './decorators/model.decorator';
import { Type } from './decorators/type.decorator';
import { registerEnum } from './decorators/enum.decorator';
import { Field } from './decorators/fields.decorator';
import { Relation } from './decorators/relation.decorator';

export { PrismaSchema, PrismaModule, PrismaService };
export { Model, Type, registerEnum, Field, Relation };

export * from '@nestjs!/refract';
