import { PrismaSchema } from '../builder/prisma-schema.factory';
import { Model as RefractModel } from '@nestjs!/refract';
import { Field as RefractTypeField, Compound as RefractCompound } from '@nestjs!/refract/dist/types/fields';

export function Model(): ClassDecorator;
export function Model<T extends RefractCompound>(name: string): ClassDecorator;
export function Model<T extends RefractCompound>(name: string, options: ModelOptions): ClassDecorator;
export function Model<T extends RefractCompound>(name: string, blocks: RefractTypeField<T>[]): ClassDecorator;
export function Model<T extends RefractCompound>(blocks: RefractTypeField<T>[]): ClassDecorator;
export function Model<T extends RefractCompound>(options: ModelOptions): ClassDecorator;
export function Model<T extends RefractCompound>(blocks: RefractTypeField<T>[], options: ModelOptions): ClassDecorator;
export function Model<T extends RefractCompound>(
  name: string,
  blocks: RefractTypeField<T>[],
  options?: ModelOptions
): ClassDecorator;
export function Model<T extends RefractCompound>(
  name?: string | RefractTypeField<T>[] | ModelOptions,
  blocks?: RefractTypeField<T>[] | ModelOptions,
  options?: ModelOptions
): ClassDecorator {
  let _name = typeof name == 'string' ? name : undefined;
  let _blocks: RefractTypeField<T>[] = Array.isArray(name)
    ? (name as RefractTypeField<T>[])
    : Array.isArray(blocks)
    ? blocks
    : undefined;
  let _options: ModelOptions =
    typeof name == 'object' && !Array.isArray(name)
      ? (name as ModelOptions)
      : typeof blocks == 'object' && !Array.isArray(blocks)
      ? (blocks as ModelOptions)
      : options;
  return (target) => {
    let model = RefractModel(_name ? _name : target.name, _options?.comment);
    console.log('Blocks', _blocks);
    _blocks?.forEach((block) => {
      model.Block(block);
    });
    PrismaSchema.addBlock(target.name, model);
  };
}

export interface ModelOptions {
  comment?: string;
}
