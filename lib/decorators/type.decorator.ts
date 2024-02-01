import { PrismaSchema } from '../builder/prisma-schema.factory';
import { Type as RefractType } from '@nestjs!/refract';

export function Type(): ClassDecorator;
export function Type(options: TypeOptions): ClassDecorator;
export function Type(name: string, options?: TypeOptions): ClassDecorator;
export function Type(name?: string | TypeOptions, options?: TypeOptions): ClassDecorator {
  let [_name, _options = {}] = typeof name == 'string' ? [name, options] : [undefined, name];
  return (target) => {
    PrismaSchema.addBlock(target.name, RefractType(_name ? _name : target.name, _options?.comment));
  };
}

export interface TypeOptions {
  comment?: string;
}
